export type FoodItem = {
  id: string
  type: 'system' | 'user'
  name_sr: string
  search_name: string
  category_id: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export const CATEGORIES = [
  { id: 'cat-protein',   name: 'Proteini',        icon: '🥩' },
  { id: 'cat-carbs',     name: 'Ugljeni hidrati',  icon: '🌾' },
  { id: 'cat-fat',       name: 'Masti',            icon: '🫒' },
  { id: 'cat-vegetable', name: 'Povrće',           icon: '🥦' },
  { id: 'cat-fruit',     name: 'Voće',             icon: '🍎' },
  { id: 'cat-other',     name: 'Ostalo',           icon: '🍽️' },
]

export const SYSTEM_FOODS: FoodItem[] = [
  // PROTEINI
  { id:'sf-pileca-prsa',   type:'system', category_id:'cat-protein',   name_sr:'Pileća prsa',        search_name:'pileca prsa',        calories_kcal:165, protein_g:31,  carbs_g:0,   fat_g:3.6 },
  { id:'sf-piletina-file', type:'system', category_id:'cat-protein',   name_sr:'Piletina file',      search_name:'piletina file',      calories_kcal:110, protein_g:23,  carbs_g:0,   fat_g:1.5 },
  { id:'sf-curece-belo',   type:'system', category_id:'cat-protein',   name_sr:'Ćureće belo meso',   search_name:'curece belo meso',   calories_kcal:135, protein_g:30,  carbs_g:0,   fat_g:1   },
  { id:'sf-govedina',      type:'system', category_id:'cat-protein',   name_sr:'Govedina mlevena',   search_name:'govedina mlevena',   calories_kcal:215, protein_g:26,  carbs_g:0,   fat_g:12  },
  { id:'sf-svinjski-file', type:'system', category_id:'cat-protein',   name_sr:'Svinjski file',      search_name:'svinjski file',      calories_kcal:143, protein_g:22,  carbs_g:0,   fat_g:6   },
  { id:'sf-losos',         type:'system', category_id:'cat-protein',   name_sr:'Losos',              search_name:'losos',              calories_kcal:208, protein_g:20,  carbs_g:0,   fat_g:13  },
  { id:'sf-tuna-konzerva', type:'system', category_id:'cat-protein',   name_sr:'Tuna (konzerva)',    search_name:'tuna konzerva',      calories_kcal:116, protein_g:26,  carbs_g:0,   fat_g:1   },
  { id:'sf-skusa',         type:'system', category_id:'cat-protein',   name_sr:'Skuša',              search_name:'skusa',              calories_kcal:205, protein_g:19,  carbs_g:0,   fat_g:14  },
  { id:'sf-jaje',          type:'system', category_id:'cat-protein',   name_sr:'Jaje (celo)',        search_name:'jaje celo',          calories_kcal:155, protein_g:13,  carbs_g:1.1, fat_g:11  },
  { id:'sf-belance',       type:'system', category_id:'cat-protein',   name_sr:'Belance',            search_name:'belance',            calories_kcal:52,  protein_g:11,  carbs_g:0.7, fat_g:0.2 },
  { id:'sf-grcki-jogurt',  type:'system', category_id:'cat-protein',   name_sr:'Grčki jogurt (0%)', search_name:'grcki jogurt',        calories_kcal:59,  protein_g:10,  carbs_g:3.6, fat_g:0.4 },
  { id:'sf-svezi-sir',     type:'system', category_id:'cat-protein',   name_sr:'Svježi sir',         search_name:'svjezi sir',         calories_kcal:98,  protein_g:11,  carbs_g:3.4, fat_g:4.3 },
  { id:'sf-whey',          type:'system', category_id:'cat-protein',   name_sr:'Whey protein',       search_name:'whey protein',       calories_kcal:380, protein_g:80,  carbs_g:5,   fat_g:3   },
  { id:'sf-jogurt',        type:'system', category_id:'cat-protein',   name_sr:'Jogurt (2.8%)',      search_name:'jogurt',             calories_kcal:61,  protein_g:3.5, carbs_g:4.7, fat_g:3.1 },
  // UGLJENI HIDRATI
  { id:'sf-pirinac',         type:'system', category_id:'cat-carbs', name_sr:'Pirinač (kuvan)',       search_name:'pirinac kuvan',       calories_kcal:130, protein_g:2.7, carbs_g:28, fat_g:0.3 },
  { id:'sf-pirinac-smedi',   type:'system', category_id:'cat-carbs', name_sr:'Pirinač smeđi (kuvan)',search_name:'pirinac smedi kuvan', calories_kcal:123, protein_g:2.7, carbs_g:26, fat_g:0.9 },
  { id:'sf-ovsene',          type:'system', category_id:'cat-carbs', name_sr:'Ovsene pahuljice',     search_name:'ovsene pahuljice',    calories_kcal:389, protein_g:17,  carbs_g:66, fat_g:7   },
  { id:'sf-krompir',         type:'system', category_id:'cat-carbs', name_sr:'Krompir (kuvan)',       search_name:'krompir kuvan',       calories_kcal:87,  protein_g:1.9, carbs_g:20, fat_g:0.1 },
  { id:'sf-slatki-krompir',  type:'system', category_id:'cat-carbs', name_sr:'Slatki krompir',       search_name:'slatki krompir',      calories_kcal:86,  protein_g:1.6, carbs_g:20, fat_g:0.1 },
  { id:'sf-testenina',       type:'system', category_id:'cat-carbs', name_sr:'Testenina (kuvana)',    search_name:'testenina kuvana',    calories_kcal:131, protein_g:5,   carbs_g:25, fat_g:1.1 },
  { id:'sf-hleb-beli',       type:'system', category_id:'cat-carbs', name_sr:'Hleb beli',            search_name:'hleb beli',           calories_kcal:265, protein_g:9,   carbs_g:49, fat_g:3.2 },
  { id:'sf-hleb-integralni', type:'system', category_id:'cat-carbs', name_sr:'Hleb integralni',      search_name:'hleb integralni',     calories_kcal:247, protein_g:13,  carbs_g:41, fat_g:4.2 },
  { id:'sf-kvinoja',         type:'system', category_id:'cat-carbs', name_sr:'Kvinoja (kuvana)',     search_name:'kvinoja kuvana',      calories_kcal:120, protein_g:4.4, carbs_g:21, fat_g:1.9 },
  { id:'sf-palenta',         type:'system', category_id:'cat-carbs', name_sr:'Palenta (kuvana)',     search_name:'palenta kuvana',      calories_kcal:70,  protein_g:1.7, carbs_g:15, fat_g:0.7 },
  { id:'sf-plazma',          type:'system', category_id:'cat-carbs', name_sr:'Plazma keks',          search_name:'plazma keks',         calories_kcal:448, protein_g:9,   carbs_g:68, fat_g:16  },
  { id:'sf-musli',           type:'system', category_id:'cat-carbs', name_sr:'Musli (bez šećera)',   search_name:'musli bez secera',    calories_kcal:360, protein_g:10,  carbs_g:66, fat_g:6   },
  // MASTI
  { id:'sf-maslinovo-ulje',    type:'system', category_id:'cat-fat', name_sr:'Maslinovo ulje',    search_name:'maslinovo ulje',    calories_kcal:884, protein_g:0,   carbs_g:0,   fat_g:100 },
  { id:'sf-suncokretovo-ulje', type:'system', category_id:'cat-fat', name_sr:'Suncokretovo ulje', search_name:'suncokretovo ulje', calories_kcal:884, protein_g:0,   carbs_g:0,   fat_g:100 },
  { id:'sf-puter',             type:'system', category_id:'cat-fat', name_sr:'Puter',             search_name:'puter',             calories_kcal:717, protein_g:0.9, carbs_g:0.1, fat_g:81  },
  { id:'sf-avokado',           type:'system', category_id:'cat-fat', name_sr:'Avokado',           search_name:'avokado',           calories_kcal:160, protein_g:2,   carbs_g:9,   fat_g:15  },
  { id:'sf-bademi',            type:'system', category_id:'cat-fat', name_sr:'Bademi',            search_name:'bademi',            calories_kcal:579, protein_g:21,  carbs_g:22,  fat_g:50  },
  { id:'sf-orasi',             type:'system', category_id:'cat-fat', name_sr:'Orasi',             search_name:'orasi',             calories_kcal:654, protein_g:15,  carbs_g:14,  fat_g:65  },
  { id:'sf-lesnici',           type:'system', category_id:'cat-fat', name_sr:'Lešnici',           search_name:'lesnici',           calories_kcal:628, protein_g:15,  carbs_g:17,  fat_g:61  },
  { id:'sf-kikiriki-puter',    type:'system', category_id:'cat-fat', name_sr:'Kikiriki puter',    search_name:'kikiriki puter',    calories_kcal:588, protein_g:25,  carbs_g:20,  fat_g:50  },
  { id:'sf-sir-gauda',         type:'system', category_id:'cat-fat', name_sr:'Sir Gauda',         search_name:'sir gauda',         calories_kcal:356, protein_g:25,  carbs_g:2.2, fat_g:28  },
  { id:'sf-kajmak',            type:'system', category_id:'cat-fat', name_sr:'Kajmak',            search_name:'kajmak',            calories_kcal:350, protein_g:3,   carbs_g:3,   fat_g:36  },
  // POVRĆE
  { id:'sf-brokoli',   type:'system', category_id:'cat-vegetable', name_sr:'Brokoli',        search_name:'brokoli',            calories_kcal:34,  protein_g:2.8, carbs_g:7,   fat_g:0.4 },
  { id:'sf-spinat',    type:'system', category_id:'cat-vegetable', name_sr:'Špinat',         search_name:'spinat',             calories_kcal:23,  protein_g:2.9, carbs_g:3.6, fat_g:0.4 },
  { id:'sf-paprika',   type:'system', category_id:'cat-vegetable', name_sr:'Paprika crvena', search_name:'paprika crvena',     calories_kcal:31,  protein_g:1,   carbs_g:6,   fat_g:0.3 },
  { id:'sf-paradajz',  type:'system', category_id:'cat-vegetable', name_sr:'Paradajz',       search_name:'paradajz',           calories_kcal:18,  protein_g:0.9, carbs_g:3.9, fat_g:0.2 },
  { id:'sf-krastavac', type:'system', category_id:'cat-vegetable', name_sr:'Krastavac',      search_name:'krastavac',          calories_kcal:15,  protein_g:0.7, carbs_g:3.6, fat_g:0.1 },
  { id:'sf-tikvice',   type:'system', category_id:'cat-vegetable', name_sr:'Tikvice',        search_name:'tikvice',            calories_kcal:17,  protein_g:1.2, carbs_g:3.1, fat_g:0.3 },
  { id:'sf-kupus',     type:'system', category_id:'cat-vegetable', name_sr:'Kupus',          search_name:'kupus',              calories_kcal:25,  protein_g:1.3, carbs_g:5.8, fat_g:0.1 },
  { id:'sf-mrkva',     type:'system', category_id:'cat-vegetable', name_sr:'Mrkva',          search_name:'mrkva',              calories_kcal:41,  protein_g:0.9, carbs_g:10,  fat_g:0.2 },
  { id:'sf-pecurke',   type:'system', category_id:'cat-vegetable', name_sr:'Pečurke',        search_name:'pecurke sampinjoni', calories_kcal:22,  protein_g:3.1, carbs_g:3.3, fat_g:0.3 },
  { id:'sf-luk',       type:'system', category_id:'cat-vegetable', name_sr:'Luk crni',       search_name:'luk crni',           calories_kcal:40,  protein_g:1.1, carbs_g:9.3, fat_g:0.1 },
  { id:'sf-beli-luk',  type:'system', category_id:'cat-vegetable', name_sr:'Beli luk',       search_name:'beli luk',           calories_kcal:149, protein_g:6.4, carbs_g:33,  fat_g:0.5 },
  { id:'sf-patlidzan', type:'system', category_id:'cat-vegetable', name_sr:'Patlidžan',      search_name:'patlidzan',          calories_kcal:25,  protein_g:1,   carbs_g:6,   fat_g:0.2 },
  { id:'sf-salata',    type:'system', category_id:'cat-vegetable', name_sr:'Zelena salata',  search_name:'zelena salata',      calories_kcal:15,  protein_g:1.4, carbs_g:2.9, fat_g:0.2 },
  { id:'sf-ajvar',     type:'system', category_id:'cat-vegetable', name_sr:'Ajvar',          search_name:'ajvar',              calories_kcal:100, protein_g:1,   carbs_g:12,  fat_g:6   },
  // VOĆE
  { id:'sf-banana',    type:'system', category_id:'cat-fruit', name_sr:'Banana',    search_name:'banana',    calories_kcal:89,  protein_g:1.1, carbs_g:23,  fat_g:0.3 },
  { id:'sf-jabuka',    type:'system', category_id:'cat-fruit', name_sr:'Jabuka',    search_name:'jabuka',    calories_kcal:52,  protein_g:0.3, carbs_g:14,  fat_g:0.2 },
  { id:'sf-jagode',    type:'system', category_id:'cat-fruit', name_sr:'Jagode',    search_name:'jagode',    calories_kcal:32,  protein_g:0.7, carbs_g:7.7, fat_g:0.3 },
  { id:'sf-borovnice', type:'system', category_id:'cat-fruit', name_sr:'Borovnice', search_name:'borovnice', calories_kcal:57,  protein_g:0.7, carbs_g:14,  fat_g:0.3 },
  { id:'sf-narandza',  type:'system', category_id:'cat-fruit', name_sr:'Narandža',  search_name:'narandza',  calories_kcal:47,  protein_g:0.9, carbs_g:12,  fat_g:0.1 },
  { id:'sf-lubenica',  type:'system', category_id:'cat-fruit', name_sr:'Lubenica',  search_name:'lubenica',  calories_kcal:30,  protein_g:0.6, carbs_g:7.6, fat_g:0.2 },
  { id:'sf-kruska',    type:'system', category_id:'cat-fruit', name_sr:'Kruška',    search_name:'kruska',    calories_kcal:57,  protein_g:0.4, carbs_g:15,  fat_g:0.1 },
  { id:'sf-malina',    type:'system', category_id:'cat-fruit', name_sr:'Malina',    search_name:'malina',    calories_kcal:52,  protein_g:1.2, carbs_g:12,  fat_g:0.7 },
  { id:'sf-kivi',      type:'system', category_id:'cat-fruit', name_sr:'Kivi',      search_name:'kivi',      calories_kcal:61,  protein_g:1.1, carbs_g:15,  fat_g:0.5 },
  { id:'sf-sljiva',    type:'system', category_id:'cat-fruit', name_sr:'Šljiva',    search_name:'sljiva',    calories_kcal:46,  protein_g:0.7, carbs_g:11,  fat_g:0.3 },
  { id:'sf-grozde',    type:'system', category_id:'cat-fruit', name_sr:'Grožđe',    search_name:'grozde',    calories_kcal:69,  protein_g:0.7, carbs_g:18,  fat_g:0.2 },
  // OSTALO
  { id:'sf-mleko',    type:'system', category_id:'cat-other', name_sr:'Mleko (2.8%)', search_name:'mleko',       calories_kcal:50,  protein_g:3.4, carbs_g:4.8, fat_g:2.8 },
  { id:'sf-kafa',     type:'system', category_id:'cat-other', name_sr:'Kafa (crna)',  search_name:'kafa crna',   calories_kcal:2,   protein_g:0.3, carbs_g:0,   fat_g:0   },
  { id:'sf-burek',    type:'system', category_id:'cat-other', name_sr:'Burek (meso)', search_name:'burek meso',  calories_kcal:280, protein_g:12,  carbs_g:25,  fat_g:14  },
  { id:'sf-gibanica', type:'system', category_id:'cat-other', name_sr:'Gibanica',     search_name:'gibanica',    calories_kcal:260, protein_g:10,  carbs_g:22,  fat_g:15  },
]

export function searchFoods(query: string, userFoods: FoodItem[] = []): FoodItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
    .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
  const all = [...userFoods, ...SYSTEM_FOODS]
  return all.filter(f => f.search_name.includes(q)).slice(0, 30)
}
