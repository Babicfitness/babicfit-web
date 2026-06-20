export type FoodItem = {
  id: string
  type: 'system' | 'user'
  name_sr: string
  search_name: string
  category_id: string
  icon?: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_g?: number       // gram weight of one serving (e.g. 30 for whey scoop)
  serving_label?: string   // label for one serving (e.g. 'merica')
}

export const CATEGORIES = [
  { id: 'cat-meso',      name: 'Meso',                icon: '🥩' },
  { id: 'cat-riba',      name: 'Riba',                icon: '🐟' },
  { id: 'cat-jaja',      name: 'Jaja',                icon: '🥚' },
  { id: 'cat-mlecni',   name: 'Mlečni',              icon: '🥛' },
  { id: 'cat-supp',      name: 'Suplementi',          icon: '💊' },
  { id: 'cat-zitarice',  name: 'Žitarice',            icon: '🌾' },
  { id: 'cat-hleb',      name: 'Hleb & Tortilje',     icon: '🍞' },
  { id: 'cat-krompir',   name: 'Krompir & Mahunarke', icon: '🥔' },
  { id: 'cat-voce',      name: 'Voće',                icon: '🍎' },
  { id: 'cat-povrce',    name: 'Povrće',              icon: '🥦' },
  { id: 'cat-ulja',      name: 'Ulja',                icon: '🫙' },
  { id: 'cat-orasasti',  name: 'Orašasti plodovi',    icon: '🥜' },
  { id: 'cat-semenke',   name: 'Semenke',             icon: '🌱' },
  { id: 'cat-ostalo',    name: 'Ostalo',              icon: '🍽️' },
]

export const SYSTEM_FOODS: FoodItem[] = [

  // ── MESO ─────────────────────────────────────────────────────────────────────
  { id:'sf-piletina-belo',  type:'system', category_id:'cat-meso',    name_sr:'Piletina (belo meso)',           search_name:'piletina belo meso file pileca prsa',    calories_kcal:110, protein_g:23,  carbs_g:0,   fat_g:1.2 },
  { id:'sf-curetina-file',  type:'system', category_id:'cat-meso',    name_sr:'Ćuretina (file)',                search_name:'curetina file curece belo',              calories_kcal:110, protein_g:22,  carbs_g:0,   fat_g:1.5 },
  { id:'sf-junetina-nem',   type:'system', category_id:'cat-meso',    name_sr:'Junetina nemasna',               search_name:'junetina nemasna govedina odrezak',      calories_kcal:140, protein_g:21,  carbs_g:0,   fat_g:5   },
  { id:'sf-junetina-mlev',  type:'system', category_id:'cat-meso',    name_sr:'Junetina mlevena',               search_name:'junetina mlevena govedina mlevena',      calories_kcal:140, protein_g:20,  carbs_g:0,   fat_g:5.5 },
  { id:'sf-svinjski-kare',  type:'system', category_id:'cat-meso',    name_sr:'Svinjski kare',                  search_name:'svinjski kare kotlet',                   calories_kcal:180, protein_g:21,  carbs_g:0,   fat_g:9   },
  { id:'sf-diml-prsa',      type:'system', category_id:'cat-meso',    name_sr:'Dimljene pileće grudi',          search_name:'dimljene pilece grudi prsa',             calories_kcal:130, protein_g:27,  carbs_g:1,   fat_g:2   },
  { id:'sf-suva-pecen',     type:'system', category_id:'cat-meso',    name_sr:'Suva pečenica',                  search_name:'suva peceniba',                          calories_kcal:230, protein_g:20,  carbs_g:1,   fat_g:15  },
  { id:'sf-prsuta',         type:'system', category_id:'cat-meso',    name_sr:'Suva pršuta',                    search_name:'suva prsuta prsut',                      calories_kcal:250, protein_g:25,  carbs_g:0,   fat_g:16  },
  { id:'sf-slanina',        type:'system', category_id:'cat-meso',    name_sr:'Slanina / pančeta',              search_name:'slanina panceta',                        calories_kcal:450, protein_g:12,  carbs_g:0,   fat_g:42  },

  // ── RIBA ─────────────────────────────────────────────────────────────────────
  { id:'sf-losos',          type:'system', category_id:'cat-riba',    name_sr:'Losos',                          search_name:'losos',                                  calories_kcal:165, protein_g:20,  carbs_g:0,   fat_g:9   },
  { id:'sf-oslic',          type:'system', category_id:'cat-riba',    name_sr:'Oslić',                          search_name:'oslic',                                  calories_kcal:80,  protein_g:17,  carbs_g:0,   fat_g:1   },
  { id:'sf-tuna',           type:'system', category_id:'cat-riba',    name_sr:'Tuna (u komadu / konzerva)',     search_name:'tuna komad konzerva',                    calories_kcal:115, protein_g:25,  carbs_g:0,   fat_g:1   },
  { id:'sf-saran',          type:'system', category_id:'cat-riba',    name_sr:'Šaran',                          search_name:'saran',                                  calories_kcal:105, protein_g:18,  carbs_g:0,   fat_g:4   },
  { id:'sf-pastrmka',       type:'system', category_id:'cat-riba',    name_sr:'Pastrmka',                       search_name:'pastrmka',                               calories_kcal:105, protein_g:19,  carbs_g:0,   fat_g:4   },
  { id:'sf-skusa',          type:'system', category_id:'cat-riba',    name_sr:'Skuša',                          search_name:'skusa',                                  calories_kcal:165, protein_g:19,  carbs_g:0,   fat_g:10  },
  { id:'sf-morski-plodovi', type:'system', category_id:'cat-riba',    name_sr:'Morski plodovi (lignje, gambori)', search_name:'morski plodovi lignje gambori skoljke', calories_kcal:100, protein_g:18, carbs_g:2,  fat_g:2   },

  // ── JAJA ─────────────────────────────────────────────────────────────────────
  { id:'sf-jaje-celo',      type:'system', category_id:'cat-jaja',    name_sr:'Celo jaje (1 kom ≈ 60g)',        search_name:'jaje celo komad',                        calories_kcal:140, protein_g:12,  carbs_g:1,   fat_g:10  },
  { id:'sf-belance',        type:'system', category_id:'cat-jaja',    name_sr:'Belance (1 kom ≈ 35g)',          search_name:'belance jaje belo',                      calories_kcal:52,  protein_g:11,  carbs_g:0.7, fat_g:0.2 },

  // ── MLEČNI PROIZVODI ─────────────────────────────────────────────────────────
  { id:'sf-skyr',           type:'system', category_id:'cat-mlecni',  name_sr:'Skyr sir',                       search_name:'skyr sir',                               calories_kcal:60,  protein_g:9,   carbs_g:5,   fat_g:0.2 },
  { id:'sf-grcki-jog',      type:'system', category_id:'cat-mlecni',  name_sr:'Grčki jogurt (low-fat)',          search_name:'grcki jogurt low fat',                   calories_kcal:60,  protein_g:9,   carbs_g:4,   fat_g:0.4 },
  { id:'sf-jogurt-light',   type:'system', category_id:'cat-mlecni',  name_sr:'Jogurt (0.5–1% m.m.)',           search_name:'jogurt 05 1 posto',                      calories_kcal:45,  protein_g:4,   carbs_g:5,   fat_g:0.7 },
  { id:'sf-cottage',        type:'system', category_id:'cat-mlecni',  name_sr:'Cottage sir',                    search_name:'cottage sir skuta svjezi',               calories_kcal:85,  protein_g:11,  carbs_g:3,   fat_g:4   },
  { id:'sf-mocarela',       type:'system', category_id:'cat-mlecni',  name_sr:'Mozzarella',                     search_name:'mocarela mozzarella',                    calories_kcal:250, protein_g:22,  carbs_g:2,   fat_g:18  },
  { id:'sf-feta',           type:'system', category_id:'cat-mlecni',  name_sr:'Feta sir',                       search_name:'feta sir',                               calories_kcal:250, protein_g:14,  carbs_g:4,   fat_g:20  },
  { id:'sf-gauda',          type:'system', category_id:'cat-mlecni',  name_sr:'Gauda / Edamer',                 search_name:'gauda edamer sir',                       calories_kcal:380, protein_g:25,  carbs_g:2,   fat_g:31  },
  { id:'sf-ricotta',        type:'system', category_id:'cat-mlecni',  name_sr:'Ricotta',                        search_name:'ricotta',                                calories_kcal:135, protein_g:10,  carbs_g:4,   fat_g:9   },
  { id:'sf-parmezan',       type:'system', category_id:'cat-mlecni',  name_sr:'Parmezan',                       search_name:'parmezan parmagiano',                    calories_kcal:420, protein_g:38,  carbs_g:4,   fat_g:29  },
  { id:'sf-krem-sir',       type:'system', category_id:'cat-mlecni',  name_sr:'Krem sir',                       search_name:'krem sir philadelphia',                  calories_kcal:200, protein_g:5,   carbs_g:4,   fat_g:18  },
  { id:'sf-mleko-32',       type:'system', category_id:'cat-mlecni',  name_sr:'Kravlje mleko (3.2%)',            search_name:'kravlje mleko 32',                       calories_kcal:65,  protein_g:3.2, carbs_g:4.7, fat_g:3.6 },
  { id:'sf-protein-puding', type:'system', category_id:'cat-mlecni',  name_sr:'Proteinski puding',              search_name:'proteinski puding',                      calories_kcal:75,  protein_g:9,   carbs_g:7,   fat_g:1.5 },

  // ── SUPLEMENTI ───────────────────────────────────────────────────────────────
  { id:'sf-whey',           type:'system', category_id:'cat-supp',    name_sr:'Whey protein prah',              search_name:'whey protein prah',                      calories_kcal:400, protein_g:83,  carbs_g:10,  fat_g:5,   serving_g:30, serving_label:'merica' },

  // ── ŽITARICE ─────────────────────────────────────────────────────────────────
  { id:'sf-pirinac-beli',   type:'system', category_id:'cat-zitarice', icon:'🍚', name_sr:'Beli pirinač (sirovi)',          search_name:'beli pirinac sirov',                     calories_kcal:365, protein_g:7,   carbs_g:80,  fat_g:0.7 },
  { id:'sf-testenina-int',  type:'system', category_id:'cat-zitarice', icon:'🍝', name_sr:'Integralna testenina (sirova)', search_name:'integralna testenina sirova',             calories_kcal:355, protein_g:13,  carbs_g:70,  fat_g:2   },
  { id:'sf-ovsene',         type:'system', category_id:'cat-zitarice', icon:'🌾', name_sr:'Ovsene pahuljice (sirove)',     search_name:'ovsene pahuljice sirove',                calories_kcal:379, protein_g:13,  carbs_g:68,  fat_g:7   },
  { id:'sf-kus-kus',        type:'system', category_id:'cat-zitarice', icon:'🌾', name_sr:'Kus-kus (sirovi)',              search_name:'kuskus kus kus sirov',                   calories_kcal:355, protein_g:12,  carbs_g:72,  fat_g:2   },
  { id:'sf-kinoja',         type:'system', category_id:'cat-zitarice', icon:'🌿', name_sr:'Kinoa (sirova)',                search_name:'kinoa kvinoja sirova',                   calories_kcal:368, protein_g:14,  carbs_g:64,  fat_g:6   },
  { id:'sf-palenta',        type:'system', category_id:'cat-zitarice', icon:'🌽', name_sr:'Palenta (suva)',                search_name:'palenta suva kukuruzan griz',            calories_kcal:360, protein_g:8,   carbs_g:77,  fat_g:1   },
  { id:'sf-pirincan-griz',  type:'system', category_id:'cat-zitarice', icon:'🍚', name_sr:'Pirinčani griz (sirovi)',       search_name:'pirincan griz sirov',                    calories_kcal:355, protein_g:7,   carbs_g:80,  fat_g:0.5 },
  { id:'sf-rizo',           type:'system', category_id:'cat-zitarice', icon:'🍚', name_sr:'Arborio riža / rižoto',         search_name:'arborio riza rizoto sirov',              calories_kcal:352, protein_g:7,   carbs_g:78,  fat_g:0.5 },
  { id:'sf-heljda',         type:'system', category_id:'cat-zitarice', icon:'🌾', name_sr:'Heljda (sirova)',               search_name:'heljda sirova',                          calories_kcal:343, protein_g:13,  carbs_g:72,  fat_g:3.4 },

  // ── HLEB & TORTILJE ──────────────────────────────────────────────────────────
  { id:'sf-hleb-int',       type:'system', category_id:'cat-hleb',    name_sr:'Integralni hleb / toast',        search_name:'integralni hleb toast',                  calories_kcal:247, protein_g:9,   carbs_g:41,  fat_g:3   },
  { id:'sf-hleb-beli',      type:'system', category_id:'cat-hleb',    name_sr:'Beli hleb / toast',              search_name:'beli hleb toast',                        calories_kcal:265, protein_g:9,   carbs_g:50,  fat_g:3   },
  { id:'sf-tortilja',       type:'system', category_id:'cat-hleb',    name_sr:'Tortilja',                       search_name:'tortilja',                               calories_kcal:310, protein_g:8,   carbs_g:52,  fat_g:7   },
  { id:'sf-wasa',           type:'system', category_id:'cat-hleb',    name_sr:'WASA hleb (sa susamom)',          search_name:'wasa hleb susamom',                      calories_kcal:335, protein_g:11,  carbs_g:58,  fat_g:7   },
  { id:'sf-rice-cake',      type:'system', category_id:'cat-hleb',    name_sr:'Rice cake',                      search_name:'rice cake pirincan',                     calories_kcal:385, protein_g:8,   carbs_g:82,  fat_g:2   },
  { id:'sf-dvopek',         type:'system', category_id:'cat-hleb',    name_sr:'Dvopek',                         search_name:'dvopek prepecenac',                      calories_kcal:390, protein_g:11,  carbs_g:76,  fat_g:5   },

  // ── KROMPIR & MAHUNARKE ──────────────────────────────────────────────────────
  { id:'sf-krompir',        type:'system', category_id:'cat-krompir', icon:'🥔', name_sr:'Krompir (sirovi)',               search_name:'krompir sirov',                          calories_kcal:77,  protein_g:2,   carbs_g:17,  fat_g:0.1 },
  { id:'sf-batat',          type:'system', category_id:'cat-krompir', icon:'🍠', name_sr:'Batat / Slatki krompir',        search_name:'batat slatki krompir sirov',             calories_kcal:86,  protein_g:1.6, carbs_g:20,  fat_g:0.1 },
  { id:'sf-kukuruz',        type:'system', category_id:'cat-krompir', icon:'🌽', name_sr:'Kukuruz (zrno / konzerva)',     search_name:'kukuruz zrno konzerva',                  calories_kcal:86,  protein_g:3,   carbs_g:19,  fat_g:1.2 },
  { id:'sf-grasak',         type:'system', category_id:'cat-krompir', icon:'🟢', name_sr:'Grašak (sirovi / zamrz.)',      search_name:'grasak sirov zamrznut',                  calories_kcal:81,  protein_g:5,   carbs_g:14,  fat_g:0.4 },
  { id:'sf-boranija',       type:'system', category_id:'cat-krompir', icon:'🫘', name_sr:'Boranija (sirova)',              search_name:'boranija mahune sirova',                 calories_kcal:31,  protein_g:2,   carbs_g:7,   fat_g:0.2 },
  { id:'sf-leblebija',      type:'system', category_id:'cat-krompir', icon:'🫘', name_sr:'Leblebija (sirova)',             search_name:'leblebija slanutak sirova',              calories_kcal:364, protein_g:19,  carbs_g:61,  fat_g:6   },
  { id:'sf-pasulj',         type:'system', category_id:'cat-krompir', icon:'🫘', name_sr:'Pasulj (sirovi)',                search_name:'pasulj grah sirov',                      calories_kcal:337, protein_g:22,  carbs_g:61,  fat_g:1   },
  { id:'sf-socivo',         type:'system', category_id:'cat-krompir', icon:'🟤', name_sr:'Sočivo (sirovo)',               search_name:'socivo leca sirovo',                     calories_kcal:352, protein_g:25,  carbs_g:60,  fat_g:1   },

  // ── VOĆE ─────────────────────────────────────────────────────────────────────
  { id:'sf-banana',         type:'system', category_id:'cat-voce',    name_sr:'Banana',                         search_name:'banana',                                 calories_kcal:89,  protein_g:1.1, carbs_g:23,  fat_g:0.3 },
  { id:'sf-jabuka',         type:'system', category_id:'cat-voce',    name_sr:'Jabuka',                         search_name:'jabuka',                                 calories_kcal:52,  protein_g:0.3, carbs_g:14,  fat_g:0.2 },
  { id:'sf-malina',         type:'system', category_id:'cat-voce',    name_sr:'Maline',                         search_name:'malina maline',                          calories_kcal:52,  protein_g:1.2, carbs_g:12,  fat_g:0.6 },
  { id:'sf-jagode',         type:'system', category_id:'cat-voce',    name_sr:'Jagode',                         search_name:'jagode',                                 calories_kcal:32,  protein_g:0.7, carbs_g:7.7, fat_g:0.3 },
  { id:'sf-borovnice',      type:'system', category_id:'cat-voce',    name_sr:'Borovnice',                      search_name:'borovnice',                              calories_kcal:57,  protein_g:0.7, carbs_g:14,  fat_g:0.3 },
  { id:'sf-visnja',         type:'system', category_id:'cat-voce',    name_sr:'Višnje / trešnje',               search_name:'visnja tresnja',                         calories_kcal:50,  protein_g:1,   carbs_g:12,  fat_g:0.3 },
  { id:'sf-kruska',         type:'system', category_id:'cat-voce',    name_sr:'Kruška',                         search_name:'kruska',                                 calories_kcal:57,  protein_g:0.4, carbs_g:15,  fat_g:0.1 },
  { id:'sf-narandza',       type:'system', category_id:'cat-voce',    name_sr:'Narandža / Mandarina',           search_name:'narandza mandarina',                     calories_kcal:47,  protein_g:0.9, carbs_g:12,  fat_g:0.1 },
  { id:'sf-mango',          type:'system', category_id:'cat-voce',    name_sr:'Mango',                          search_name:'mango',                                  calories_kcal:60,  protein_g:0.8, carbs_g:15,  fat_g:0.4 },
  { id:'sf-ananas',         type:'system', category_id:'cat-voce',    name_sr:'Ananas',                         search_name:'ananas',                                 calories_kcal:50,  protein_g:0.5, carbs_g:13,  fat_g:0.1 },
  { id:'sf-sumsko-voce',    type:'system', category_id:'cat-voce',    name_sr:'Šumsko voće (mešano)',           search_name:'sumsko voce mesano',                     calories_kcal:50,  protein_g:1,   carbs_g:12,  fat_g:0.3 },

  // ── POVRĆE ───────────────────────────────────────────────────────────────────
  { id:'sf-sampinjoni',     type:'system', category_id:'cat-povrce',  name_sr:'Šampinjoni',                     search_name:'sampinjoni pecurke',                     calories_kcal:22,  protein_g:3,   carbs_g:3,   fat_g:0.3 },
  { id:'sf-brokoli',        type:'system', category_id:'cat-povrce',  name_sr:'Brokoli',                        search_name:'brokoli',                                calories_kcal:34,  protein_g:2.8, carbs_g:7,   fat_g:0.4 },
  { id:'sf-karfiol',        type:'system', category_id:'cat-povrce',  name_sr:'Karfiol',                        search_name:'karfiol',                                calories_kcal:25,  protein_g:1.9, carbs_g:5,   fat_g:0.3 },
  { id:'sf-sargarepa',      type:'system', category_id:'cat-povrce',  name_sr:'Šargarepa',                      search_name:'sargarepa mrkva',                        calories_kcal:41,  protein_g:0.9, carbs_g:10,  fat_g:0.2 },
  { id:'sf-krastavac',      type:'system', category_id:'cat-povrce',  name_sr:'Krastavac',                      search_name:'krastavac',                              calories_kcal:15,  protein_g:0.7, carbs_g:3.6, fat_g:0.1 },
  { id:'sf-paradajz',       type:'system', category_id:'cat-povrce',  name_sr:'Paradajz',                       search_name:'paradajz',                               calories_kcal:18,  protein_g:0.9, carbs_g:3.9, fat_g:0.2 },
  { id:'sf-salata',         type:'system', category_id:'cat-povrce',  name_sr:'Iceberg salata / mix zelenih',  search_name:'iceberg salata mix zelena',              calories_kcal:15,  protein_g:1.2, carbs_g:2.5, fat_g:0.2 },
  { id:'sf-paprika-cr',     type:'system', category_id:'cat-povrce',  name_sr:'Crvena paprika',                 search_name:'crvena paprika',                         calories_kcal:31,  protein_g:1,   carbs_g:6,   fat_g:0.3 },
  { id:'sf-paprika-zel',    type:'system', category_id:'cat-povrce',  name_sr:'Zelena paprika',                 search_name:'zelena paprika',                         calories_kcal:20,  protein_g:0.9, carbs_g:4.6, fat_g:0.2 },
  { id:'sf-tikvice',        type:'system', category_id:'cat-povrce',  name_sr:'Tikvica',                        search_name:'tikvica tikvice',                        calories_kcal:17,  protein_g:1.2, carbs_g:3.1, fat_g:0.3 },
  { id:'sf-spinat',         type:'system', category_id:'cat-povrce',  name_sr:'Španać / Baby španać',          search_name:'spanac baby spinat',                     calories_kcal:23,  protein_g:2.9, carbs_g:3.6, fat_g:0.4 },
  { id:'sf-bundeva',        type:'system', category_id:'cat-povrce',  name_sr:'Bundeva',                        search_name:'bundeva tikva',                          calories_kcal:26,  protein_g:1,   carbs_g:6.5, fat_g:0.1 },
  { id:'sf-luk-crni',       type:'system', category_id:'cat-povrce',  name_sr:'Crni luk',                       search_name:'crni luk',                               calories_kcal:40,  protein_g:1.1, carbs_g:9,   fat_g:0.1 },
  { id:'sf-luk-crveni',     type:'system', category_id:'cat-povrce',  name_sr:'Crveni luk',                     search_name:'crveni luk',                             calories_kcal:40,  protein_g:1.1, carbs_g:9,   fat_g:0.1 },
  { id:'sf-beli-luk',       type:'system', category_id:'cat-povrce',  name_sr:'Beli luk',                       search_name:'beli luk',                               calories_kcal:149, protein_g:6.4, carbs_g:33,  fat_g:0.5 },
  { id:'sf-praziluk',       type:'system', category_id:'cat-povrce',  name_sr:'Praziluk / Mladi luk',           search_name:'praziluk mladi luk vlasac',              calories_kcal:30,  protein_g:1.8, carbs_g:7,   fat_g:0.3 },
  { id:'sf-kupus',          type:'system', category_id:'cat-povrce',  name_sr:'Kupus (beli, sirovi)',            search_name:'kupus beli sirov',                       calories_kcal:25,  protein_g:1.3, carbs_g:5.8, fat_g:0.1 },

  // ── ULJA ─────────────────────────────────────────────────────────────────────
  { id:'sf-maslinovo',      type:'system', category_id:'cat-ulja',    name_sr:'Maslinovo ulje',                 search_name:'maslinovo ulje',                         calories_kcal:884, protein_g:0,   carbs_g:0,   fat_g:100 },
  { id:'sf-kokosovo-ulje',  type:'system', category_id:'cat-ulja',    name_sr:'Kokosovo ulje',                  search_name:'kokosovo ulje',                          calories_kcal:892, protein_g:0,   carbs_g:0,   fat_g:99  },
  { id:'sf-light-puter',    type:'system', category_id:'cat-ulja',    name_sr:'Light puter',                    search_name:'light puter',                            calories_kcal:350, protein_g:0.5, carbs_g:0.5, fat_g:39  },
  { id:'sf-bademovo-mleko', type:'system', category_id:'cat-ulja',    name_sr:'Bademovo mleko (neslađeno)',     search_name:'bademovo mleko neslad',                  calories_kcal:20,  protein_g:0.4, carbs_g:0.8, fat_g:1.5 },
  { id:'sf-kokosovo-mleko', type:'system', category_id:'cat-ulja',    name_sr:'Kokosovo mleko (konzerva)',      search_name:'kokosovo mleko konzerva',                calories_kcal:200, protein_g:2,   carbs_g:6,   fat_g:19  },

  // ── ORAŠASTI PLODOVI ─────────────────────────────────────────────────────────
  { id:'sf-bademi',         type:'system', category_id:'cat-orasasti', icon:'🫘', name_sr:'Bademi',                        search_name:'bademi',                                 calories_kcal:579, protein_g:21,  carbs_g:22,  fat_g:50  },
  { id:'sf-orasi',          type:'system', category_id:'cat-orasasti', icon:'🌰', name_sr:'Orasi',                         search_name:'orasi',                                  calories_kcal:654, protein_g:15,  carbs_g:14,  fat_g:65  },
  { id:'sf-lesnici',        type:'system', category_id:'cat-orasasti', icon:'🌰', name_sr:'Lešnici',                       search_name:'lesnici lesnik',                         calories_kcal:628, protein_g:15,  carbs_g:17,  fat_g:61  },
  { id:'sf-kikiriki',       type:'system', category_id:'cat-orasasti', icon:'🥜', name_sr:'Kikiriki',                      search_name:'kikiriki',                               calories_kcal:567, protein_g:26,  carbs_g:16,  fat_g:49  },
  { id:'sf-pistaci',        type:'system', category_id:'cat-orasasti', icon:'🫘', name_sr:'Pistaći',                       search_name:'pistaci',                                calories_kcal:560, protein_g:20,  carbs_g:28,  fat_g:45  },
  { id:'sf-kikiriki-puter', type:'system', category_id:'cat-orasasti', icon:'🥜', name_sr:'Kikiriki puter',                search_name:'kikiriki puter',                         calories_kcal:588, protein_g:25,  carbs_g:20,  fat_g:50  },

  // ── SEMENKE ──────────────────────────────────────────────────────────────────
  { id:'sf-chia',           type:'system', category_id:'cat-semenke', icon:'🌱', name_sr:'Chia semenke',                   search_name:'chia semenke',                           calories_kcal:486, protein_g:17,  carbs_g:42,  fat_g:31  },
  { id:'sf-laneno',         type:'system', category_id:'cat-semenke', icon:'🌱', name_sr:'Laneno seme',                    search_name:'laneno seme lanene semenke',             calories_kcal:534, protein_g:18,  carbs_g:29,  fat_g:42  },
  { id:'sf-sem-bundeve',    type:'system', category_id:'cat-semenke', icon:'🎃', name_sr:'Semenke bundeve',                search_name:'semenke bundeve',                        calories_kcal:559, protein_g:30,  carbs_g:11,  fat_g:49  },
  { id:'sf-sem-suncokret',  type:'system', category_id:'cat-semenke', icon:'🌻', name_sr:'Semenke suncokreta',             search_name:'semenke suncokreta',                     calories_kcal:584, protein_g:21,  carbs_g:20,  fat_g:51  },
  { id:'sf-susam',          type:'system', category_id:'cat-semenke', icon:'🌾', name_sr:'Susam',                          search_name:'susam',                                  calories_kcal:573, protein_g:18,  carbs_g:23,  fat_g:50  },

  // ── OSTALO ───────────────────────────────────────────────────────────────────
  { id:'sf-avokado',        type:'system', category_id:'cat-ostalo',  name_sr:'Avokado',                        search_name:'avokado',                                calories_kcal:160, protein_g:2,   carbs_g:9,   fat_g:15  },
  { id:'sf-masline',        type:'system', category_id:'cat-ostalo',  name_sr:'Masline',                        search_name:'masline',                                calories_kcal:145, protein_g:1,   carbs_g:4,   fat_g:15  },
  { id:'sf-crna-cok',       type:'system', category_id:'cat-ostalo',  name_sr:'Crna čokolada 75%',              search_name:'crna cokolada tamna',                    calories_kcal:598, protein_g:8,   carbs_g:32,  fat_g:43  },
]

export function searchFoods(query: string, userFoods: FoodItem[] = []): FoodItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
    .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
  const all = [...userFoods, ...SYSTEM_FOODS]
  return all.filter(f => f.search_name.includes(q)).slice(0, 30)
}
