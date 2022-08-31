import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import * as _ from 'lodash';
import * as soap from 'soap';

@Injectable()
export class CatalogService {
  qb: Knex;
  wsdl = 'https://portal.tian.de.com:443/soap/integration.php?wsdl';
  channel = 10;

  constructor(configService: ConfigService) {
    this.qb = configService.get('knex');
  }

  export() {
    this.exportAll().finally();
    return { success: true };
  }

  async exportAll() {
    await this.senAllSections();
    await this.sendAllElements();
  }

  async sendAllElements() {
    const limit = 100;
    const { countRows = 0 } = await this.qb('b_iblock_element')
      .count({ countRows: '*' })
      .where('IBLOCK_ID', 27)
      .first();
    const countSteps = Math.ceil(countRows / limit);
    const countStepsChannel = Math.ceil(countSteps / this.channel);
    for (let i = 0; i < countStepsChannel; i++) {
      const start = i * this.channel;
      let end = start + this.channel;
      if (end > countSteps) {
        end = countSteps;
      }
      await Promise.all(
        new Array(end - start)
          .fill(null)
          .map((_, n) => this.sendElements(limit, (n + start) * limit)),
      );
    }
  }

  async senAllSections() {
    const limit = 100;
    const { countRows = 0 } = await this.qb('b_iblock_section')
      .count({ countRows: '*' })
      .where('IBLOCK_ID', 27)
      .first();
    const countSteps = Math.ceil(countRows / limit);
    const countStepsChannel = Math.ceil(countSteps / this.channel);
    for (let i = 0; i < countStepsChannel; i++) {
      const start = i * this.channel;
      let end = start + this.channel;
      if (end > countSteps) {
        end = countSteps;
      }
      await Promise.all(
        new Array(end - start)
          .fill(null)
          .map((_, n) => this.sendSections(limit, (n + start) * limit)),
      );
    }
  }

  async sendElements(limit: number, offset: number) {
    const elements = await this.findElements(limit, offset);
    const client = await soap.createClientAsync(this.wsdl);

    return client.exchangeCatalogAsync({
      elements: {
        ArrayOfArElementsEl: elements,
      },
    });
  }

  async sendSections(limit: number, offset: number) {
    const sectionList = await this.findSections(limit, offset);
    const client = await soap.createClientAsync(this.wsdl);

    if (sectionList.length === 0) {
      return;
    }

    return client.exchangeCatalogSectionAsync({
      sections: {
        ArrayOfArSectionsEl: sectionList,
      },
    });
  }

  async findElements(limit: number, offset: number) {
    const elements = await this.qb({ ibe: 'b_iblock_element' })
      .select(
        'ibe.ID as productId',
        'ibe.XML_ID as xlmlId',
        'ibe.IBLOCK_SECTION_ID as sectionId',
        'ibe.NAME as name',
        'ibe.CODE as code',
        'ibe.ACTIVE as active',
        'ibe.SORT as sort',
        'ibp.PROPERTY_553 as usage',
        'ibp.PROPERTY_523 as volume',
        'ibp.PROPERTY_542 as article',
        this.qb.raw(
          'CONCAT_WS("/", "", "upload", f.SUBDIR, f.FILE_NAME) as image',
        ),
        'ibe.DETAIL_TEXT as detailText',
        'ibp.PROPERTY_550 as hlItemType',
        't.UF_NAME as itemTypeName',
        's.XML_ID as sectionXmlId',
      )
      .leftJoin(
        { ibp: 'b_iblock_element_prop_s27' },
        'ibp.IBLOCK_ELEMENT_ID',
        'ibe.ID',
      )
      .leftJoin({ t: 'b_bititemtype' }, 't.UF_XML_ID', 'ibp.PROPERTY_550')
      .leftJoin({ s: 'b_iblock_section' }, 's.ID', 'ibe.IBLOCK_SECTION_ID')
      .leftJoin({ f: 'b_file' }, 'f.ID', 'ibe.PREVIEW_PICTURE')
      .where('ibe.IBLOCK_ID', 27)
      .orderBy('ibe.ID', 'ASC')
      .limit(limit)
      .offset(offset);

    if (elements.length === 0) {
      return;
    }

    const xmlId = _.map(elements, 'xlmlId');
    const id = _.map(elements, 'productId');
    const [countries, languages, sets, gifts, offersElements, sections] =
      await Promise.all([
        this.qb('b_bit_catalog_element_country')
          .whereIn('UF_XML_ID', xmlId)
          .select('UF_XML_ID as xmlId', 'UF_COUNTRY as country'),
        this.qb({ t: 'bit_item_lang_texts' })
          .leftJoin({ l: 'bit_lang' }, 'l.ID', 't.UF_LANG_ID')
          .whereIn('t.UF_ITEM_ID', id)
          .select(
            't.UF_ITEM_ID as id',
            't.UF_NAME as langName',
            't.UF_DETAIL_TEXT as langDescription',
            'l.UF_LANG_ID as lang',
          ),
        getSetsGiftQuery(this.qb, 599),
        getSetsGiftQuery(this.qb, 600),
        this.qb('b_iblock_element_property')
          .where('IBLOCK_PROPERTY_ID', 111)
          .whereIn('VALUE', id)
          .select('VALUE as id', 'IBLOCK_ELEMENT_ID as offerId'),
        findSectionUrl(this.qb),
      ]);

    const offerId = offersElements.map((offerElement) => offerElement.offerId);
    const [catProducts, storages, bxSets, catPrices] = await Promise.all([
      this.qb('b_catalog_product')
        .whereIn('ID', offerId)
        .select(
          'ID as id',
          'QUANTITY as quantity',
          'WEIGHT as weight',
          'WIDTH as width',
          'LENGTH as length',
          'HEIGHT as height',
        ),
      this.qb('b_iblock_element_property')
        .where('IBLOCK_PROPERTY_ID', 598)
        .whereIn('IBLOCK_ELEMENT_ID', offerId)
        .select('IBLOCK_ELEMENT_ID as id', 'VALUE as storageId'),
      this.qb({ s: 'b_catalog_product_sets' })
        .leftJoin({ p: 'b_iblock_element_property' }, (qb) =>
          qb
            .on('p.IBLOCK_ELEMENT_ID', 's.ITEM_ID')
            .andOn('p.IBLOCK_PROPERTY_ID', this.qb.raw(111)),
        )
        .leftJoin({ e: 'b_iblock_element' }, 'e.ID', 'p.VALUE')
        .whereIn('s.OWNER_ID', offerId)
        .where('s.SET_ID', '>', 0)
        .groupBy('e.XML_ID')
        .select(
          'e.XML_ID as xlmlId',
          's.SORT as sort',
          's.QUANTITY as quantity',
          's.OWNER_ID as id',
        ),
      this.qb({ p: 'b_catalog_price' })
        .leftJoin({ g: 'b_catalog_group' }, 'g.ID', 'p.CATALOG_GROUP_ID')
        .whereIn('p.PRODUCT_ID', offerId)
        .orderBy('p.PRICE', 'desc')
        .select(
          'g.XML_ID as priceType',
          'p.PRICE as price',
          'p.CURRENCY as currency',
          'p.PRODUCT_ID as id',
        ),
    ]);

    return elements.map((element) => {
      const id = Number(element.productId);
      const offerId = findOfferByElementId(id);
      const langName = findLangByProductId(id, 'langName');
      const langDescription = findLangByProductId(id, 'langDescription');
      const section = _.chain(sections)
        .filter({ id: Number(element.sectionId) })
        .map('url')
        .first()
        .value();

      const detailPageUrl =
        '/' + ['catalog', section, id].filter((text) => !!text).join('/') + '/';

      langName['ru'] = element.name;
      langDescription['ru'] = escape(element.detailText);

      const xmlSets = [
        '37243fe8-e35a-11e4-81eb-c53dde4ed71b',
        'c65fe453-e8fc-11e4-81eb-c53dde4ed71b',
      ];
      let structure = [];
      if (xmlSets.includes(element.hlItemType)) {
        structure = _.chain(bxSets)
          .filter((set) => offerId.includes(Number(set.id)))
          .map((set) => _.omit(set, 'id'))
          .value();
      }

      const ctalogProps = _.omit(
        catProducts.find((cat) => offerId.includes(Number(cat.id))),
        ['id', 'quantity'],
      );

      const prices = _.chain(catPrices)
        .filter((cat) => offerId.includes(Number(cat.id)))
        .groupBy('priceType')
        .map(([price]) => _.omit(price, ['id']))
        .value();

      return _.omit(
        {
          ...element,
          prices,
          ctalogProps,
          structure,
          detailPageUrl,
          langName,
          langDescription,
          country: _.chain(countries)
            .filter({ xmlId: element.xlmlId })
            .map('country')
            .value(),
          set: findGiftSet(sets, id),
          gifts: findGiftSet(gifts, id),
          isNabor:
            element.hlItemType === '37243fe8-e35a-11e4-81eb-c53dde4ed71b'
              ? 'Y'
              : 'N',
          type: {
            name: element.itemTypeName,
            xmlId: element.hlItemType,
          },
          remant: findRemnant(id),
        },
        ['detailText', 'hlItemType', 'itemTypeName'],
      );
    });

    function findLangByProductId(id: number, key: string) {
      return _.chain(languages)
        .filter({ id })
        .groupBy('lang')
        .mapValues(([value]) => escape(value[key]))
        .value();
    }

    function getSetsGiftQuery(qb: Knex, propertyId: number) {
      return qb({ p: 'b_iblock_element_prop_m27' })
        .leftJoin({ e: 'b_iblock_element' }, 'e.ID', 'p.VALUE')
        .where('p.IBLOCK_PROPERTY_ID', propertyId)
        .whereIn('p.IBLOCK_ELEMENT_ID', id)
        .select('p.IBLOCK_ELEMENT_ID as id', 'e.XML_ID as xmlId');
    }

    function findGiftSet(
      collection: { id: number; xmlId: string }[],
      id: number,
    ) {
      return _.chain(collection).filter({ id }).map('xmlId').value();
    }

    function findRemnant(id: number) {
      const offerId = findOfferByElementId(id);

      return offerId.map((id) => ({
        storeId: _.chain(storages)
          .filter((storage) => Number(storage.id) === id)
          .map('storageId')
          .first()
          .value(),
        quantity: _.chain(catProducts)
          .filter((storage) => Number(storage.id) === id)
          .map('quantity')
          .first()
          .value(),
      }));
    }

    function findOfferByElementId(id: number) {
      return _.chain(offersElements)
        .filter((ofEl) => Number(ofEl.id) == id)
        .map('offerId')
        .value();
    }

    async function findSectionUrl(queryBuilder: Knex) {
      const sectionId = _.chain(elements)
        .map('sectionId')
        .filter((section) => Number(section))
        .value();

      if (sectionId.length === 0) {
        return [];
      }
      return queryBuilder
        .withRecursive('cte', ['id', 'code', 'parent_id', 'select_id'], (qb) =>
          qb
            .select(
              'ID as id',
              'CODE as code',
              'IBLOCK_SECTION_ID as parent_id',
              'ID as select_id',
            )
            .from('b_iblock_section')
            .whereIn('ID', sectionId)
            .unionAll((qb) =>
              qb
                .select(
                  's.ID as id',
                  queryBuilder.raw('CONCAT_WS("/", s.CODE, cte.code) as code'),
                  's.IBLOCK_SECTION_ID as parent_id',
                  'cte.select_id as select_id',
                )
                .from({ s: 'b_iblock_section' })
                .innerJoin('cte', 's.ID', 'cte.parent_id'),
            ),
        )
        .from('cte')
        .whereNull('cte.parent_id')
        .select('cte.code as url', 'cte.select_id as id');
    }

    function escape(text: string) {
      return JSON.stringify(text);
    }
  }

  async findSections(limit: number, offset: number) {
    const sections = await this.qb({ s: 'b_iblock_section' })
      .leftJoin({ u: 'b_uts_iblock_27_section' }, 'u.VALUE_ID', 's.id')
      .leftJoin({ p: 'b_iblock_section' }, 'p.ID', 's.IBLOCK_SECTION_ID')
      .where('s.IBLOCK_ID', 27)
      .select('s.*', 'u.*', 'p.XML_ID as parentXmlId')
      .limit(limit)
      .offset(offset);
    return sections
      .map((section) => ({
        xmlId: _.get(section, 'XML_ID', ''),
        name: _.get(section, 'NAME', ''),
        code: _.get(section, 'CODE', ''),
        sort: Number(_.get(section, 'SORT', 0)),
        active: _.get(section, 'ACTIVE'),
        iblockSectionID: _.get(section, 'IBLOCK_SECTION_ID', 0),
        langName: {
          ru: escape(_.get(section, 'UF_HEADER_RU', '')),
          en: escape(_.get(section, 'UF_HEADER_EN', '')),
          cz: escape(_.get(section, 'UF_HEADER_CZ', '')),
          pl: escape(_.get(section, 'UF_HEADER_PL', '')),
        },
        langDescription: {
          ru: escape(_.get(section, 'UF_DESCRIPTION_RU', '')),
          en: escape(_.get(section, 'UF_DESCRIPTION_EN', '')),
          cz: escape(_.get(section, 'UF_DESCRIPTION_CZ', '')),
          pl: escape(_.get(section, 'UF_DESCRIPTION_PL', '')),
        },
        parentXmlId: _.get(section, 'parentXmlId', ''),
      }))
      .filter((section) => !!section);

    function escape(text: string) {
      return JSON.stringify(text);
    }
  }
}
