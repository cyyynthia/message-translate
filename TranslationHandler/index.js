const { getModule, FluxDispatcher } = require('powercord/webpack')

const { getMessage } = getModule([ "getMessages" ], false);
const translatte = require("../node_modules/translatte");
const randomUseragent = require("../node_modules/random-useragent");

class Translator {
	constructor() {
		this.cache = {};
	}

	removeExceptions = (text) => {
		let exceptions = [];

		let counter = 0;

		let replaceMatches = (matches) => {
			if (!matches) return;
			for (let match of matches) {
				exceptions.push(match);
				text = text.replace(
					new RegExp(
						match.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"),
						"g"
					),
					`[/////${counter}]`
				);
				counter++;
			}
		};

		// User and role tags.
		replaceMatches(text.match(/<@(!?|&?)\d+>/gi));
		// Channel tags.
		replaceMatches(text.match(/<#\d+>/gi));
		// Emojis.
		replaceMatches(text.match(/<(\w+)?:\w+:\d+>/gi));
		// Codeblocks.
		replaceMatches(text.match(/```(.+?|\n+)```/gis));
		// Code snippets.
		// Important to do this after codeblocks.
		replaceMatches(text.match(/`(.+?|\n+)`/gis));

		return { text, exceptions };
	};

	addExceptions = (text, exceptions) => {
		for (let i = 0; i < exceptions.length; i++) {
			let exception = exceptions[i];
			text = text.replace(
				new RegExp(
					`(\\[\\/\\/\\/\\/\\/${i}+\\]|\\[\\/\\/\\/\\/\\/ ${i}+\\])`,
					"gi"
				),
				exception
			);
		}
		return text;
	};

	/**
	 * @author Phil Teare
	 * using wikipedia data
	 */
	isoLangs = {
		ab: {
			name: "Abkhaz",
			nativeName: "аҧсуа",
		},
		aa: {
			name: "Afar",
			nativeName: "Afaraf",
		},
		af: {
			name: "Afrikaans",
			nativeName: "Afrikaans",
		},
		ak: {
			name: "Akan",
			nativeName: "Akan",
		},
		sq: {
			name: "Albanian",
			nativeName: "Shqip",
		},
		am: {
			name: "Amharic",
			nativeName: "አማርኛ",
		},
		ar: {
			name: "Arabic",
			nativeName: "العربية",
		},
		an: {
			name: "Aragonese",
			nativeName: "Aragonés",
		},
		hy: {
			name: "Armenian",
			nativeName: "Հայերեն",
		},
		as: {
			name: "Assamese",
			nativeName: "অসমীয়া",
		},
		av: {
			name: "Avaric",
			nativeName: "авар мацӀ, магӀарул мацӀ",
		},
		ae: {
			name: "Avestan",
			nativeName: "avesta",
		},
		ay: {
			name: "Aymara",
			nativeName: "aymar aru",
		},
		az: {
			name: "Azerbaijani",
			nativeName: "azərbaycan dili",
		},
		bm: {
			name: "Bambara",
			nativeName: "bamanankan",
		},
		ba: {
			name: "Bashkir",
			nativeName: "башҡорт теле",
		},
		eu: {
			name: "Basque",
			nativeName: "euskara, euskera",
		},
		be: {
			name: "Belarusian",
			nativeName: "Беларуская",
		},
		bn: {
			name: "Bengali",
			nativeName: "বাংলা",
		},
		bh: {
			name: "Bihari",
			nativeName: "भोजपुरी",
		},
		bi: {
			name: "Bislama",
			nativeName: "Bislama",
		},
		bs: {
			name: "Bosnian",
			nativeName: "bosanski jezik",
		},
		br: {
			name: "Breton",
			nativeName: "brezhoneg",
		},
		bg: {
			name: "Bulgarian",
			nativeName: "български език",
		},
		my: {
			name: "Burmese",
			nativeName: "ဗမာစာ",
		},
		ca: {
			name: "Catalan; Valencian",
			nativeName: "Català",
		},
		ceb: {
			name: "Cebuano",
			nativeName: "Cebuano",
		},
		ch: {
			name: "Chamorro",
			nativeName: "Chamoru",
		},
		ce: {
			name: "Chechen",
			nativeName: "нохчийн мотт",
		},
		ny: {
			name: "Chichewa; Chewa; Nyanja",
			nativeName: "chiCheŵa, chinyanja",
		},
		zh: {
			name: "Chinese",
			nativeName: "中文 (Zhōngwén), 汉语, 漢語",
		},
		cv: {
			name: "Chuvash",
			nativeName: "чӑваш чӗлхи",
		},
		kw: {
			name: "Cornish",
			nativeName: "Kernewek",
		},
		co: {
			name: "Corsican",
			nativeName: "corsu, lingua corsa",
		},
		cr: {
			name: "Cree",
			nativeName: "ᓀᐦᐃᔭᐍᐏᐣ",
		},
		hr: {
			name: "Croatian",
			nativeName: "hrvatski",
		},
		cs: {
			name: "Czech",
			nativeName: "česky, čeština",
		},
		da: {
			name: "Danish",
			nativeName: "dansk",
		},
		dv: {
			name: "Divehi; Dhivehi; Maldivian;",
			nativeName: "ދިވެހި",
		},
		nl: {
			name: "Dutch",
			nativeName: "Nederlands, Vlaams",
		},
		en: {
			name: "English",
			nativeName: "English",
		},
		eo: {
			name: "Esperanto",
			nativeName: "Esperanto",
		},
		et: {
			name: "Estonian",
			nativeName: "eesti, eesti keel",
		},
		ee: {
			name: "Ewe",
			nativeName: "Eʋegbe",
		},
		fo: {
			name: "Faroese",
			nativeName: "føroyskt",
		},
		fj: {
			name: "Fijian",
			nativeName: "vosa Vakaviti",
		},
		fi: {
			name: "Finnish",
			nativeName: "suomi, suomen kieli",
		},
		fr: {
			name: "French",
			nativeName: "français, langue française",
		},
		ff: {
			name: "Fula; Fulah; Pulaar; Pular",
			nativeName: "Fulfulde, Pulaar, Pular",
		},
		gl: {
			name: "Galician",
			nativeName: "Galego",
		},
		ka: {
			name: "Georgian",
			nativeName: "ქართული",
		},
		de: {
			name: "German",
			nativeName: "Deutsch",
		},
		el: {
			name: "Greek, Modern",
			nativeName: "Ελληνικά",
		},
		gn: {
			name: "Guaraní",
			nativeName: "Avañeẽ",
		},
		gu: {
			name: "Gujarati",
			nativeName: "ગુજરાતી",
		},
		ht: {
			name: "Haitian; Haitian Creole",
			nativeName: "Kreyòl ayisyen",
		},
		ha: {
			name: "Hausa",
			nativeName: "Hausa, هَوُسَ",
		},
		haw: {
			name: "Hawaiian",
			nativeName: "Hawaiian",
		},
		iw: {
			name: "Hebrew (modern)",
			nativeName: "עברית",
		},
		hz: {
			name: "Herero",
			nativeName: "Otjiherero",
		},
		hi: {
			name: "Hindi",
			nativeName: "हिन्दी, हिंदी",
		},
		ho: {
			name: "Hiri Motu",
			nativeName: "Hiri Motu",
		},
		hmn: {
			name: "Hmong, Mong",
			nativeName: "Hmong, Moob (Suav, Laos)",
		},
		hu: {
			name: "Hungarian",
			nativeName: "Magyar",
		},
		ia: {
			name: "Interlingua",
			nativeName: "Interlingua",
		},
		id: {
			name: "Indonesian",
			nativeName: "Bahasa Indonesia",
		},
		ie: {
			name: "Interlingue",
			nativeName:
				"Originally called Occidental; then Interlingue after WWII",
		},
		ga: {
			name: "Irish",
			nativeName: "Gaeilge",
		},
		ig: {
			name: "Igbo",
			nativeName: "Asụsụ Igbo",
		},
		ik: {
			name: "Inupiaq",
			nativeName: "Iñupiaq, Iñupiatun",
		},
		io: {
			name: "Ido",
			nativeName: "Ido",
		},
		is: {
			name: "Icelandic",
			nativeName: "Íslenska",
		},
		it: {
			name: "Italian",
			nativeName: "Italiano",
		},
		iu: {
			name: "Inuktitut",
			nativeName: "ᐃᓄᒃᑎᑐᑦ",
		},
		ja: {
			name: "Japanese",
			nativeName: "日本語 (にほんご／にっぽんご)",
		},
		jv: {
			name: "Javanese",
			nativeName: "basa Jawa",
		},
		kl: {
			name: "Kalaallisut, Greenlandic",
			nativeName: "kalaallisut, kalaallit oqaasii",
		},
		kn: {
			name: "Kannada",
			nativeName: "ಕನ್ನಡ",
		},
		kr: {
			name: "Kanuri",
			nativeName: "Kanuri",
		},
		ks: {
			name: "Kashmiri",
			nativeName: "कश्मीरी, كشميري‎",
		},
		kk: {
			name: "Kazakh",
			nativeName: "Қазақ тілі",
		},
		km: {
			name: "Khmer",
			nativeName: "ភាសាខ្មែរ",
		},
		ki: {
			name: "Kikuyu, Gikuyu",
			nativeName: "Gĩkũyũ",
		},
		rw: {
			name: "Kinyarwanda",
			nativeName: "Ikinyarwanda",
		},
		ky: {
			name: "Kirghiz, Kyrgyz",
			nativeName: "кыргыз тили",
		},
		kv: {
			name: "Komi",
			nativeName: "коми кыв",
		},
		kg: {
			name: "Kongo",
			nativeName: "KiKongo",
		},
		ko: {
			name: "Korean",
			nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
		},
		ku: {
			name: "Kurdish",
			nativeName: "Kurdî, كوردی‎",
		},
		kj: {
			name: "Kwanyama, Kuanyama",
			nativeName: "Kuanyama",
		},
		la: {
			name: "Latin",
			nativeName: "latine, lingua latina",
		},
		lb: {
			name: "Luxembourgish, Letzeburgesch",
			nativeName: "Lëtzebuergesch",
		},
		lg: {
			name: "Luganda",
			nativeName: "Luganda",
		},
		li: {
			name: "Limburgish, Limburgan, Limburger",
			nativeName: "Limburgs",
		},
		ln: {
			name: "Lingala",
			nativeName: "Lingála",
		},
		lo: {
			name: "Lao",
			nativeName: "ພາສາລາວ",
		},
		lt: {
			name: "Lithuanian",
			nativeName: "lietuvių kalba",
		},
		lu: {
			name: "Luba-Katanga",
			nativeName: "",
		},
		lv: {
			name: "Latvian",
			nativeName: "latviešu valoda",
		},
		gv: {
			name: "Manx",
			nativeName: "Gaelg, Gailck",
		},
		mk: {
			name: "Macedonian",
			nativeName: "македонски јазик",
		},
		mg: {
			name: "Malagasy",
			nativeName: "Malagasy fiteny",
		},
		ms: {
			name: "Malay",
			nativeName: "bahasa Melayu, بهاس ملايو‎",
		},
		ml: {
			name: "Malayalam",
			nativeName: "മലയാളം",
		},
		mt: {
			name: "Maltese",
			nativeName: "Malti",
		},
		mi: {
			name: "Māori",
			nativeName: "te reo Māori",
		},
		mr: {
			name: "Marathi (Marāṭhī)",
			nativeName: "मराठी",
		},
		mh: {
			name: "Marshallese",
			nativeName: "Kajin M̧ajeļ",
		},
		mn: {
			name: "Mongolian",
			nativeName: "монгол",
		},
		na: {
			name: "Nauru",
			nativeName: "Ekakairũ Naoero",
		},
		nv: {
			name: "Navajo, Navaho",
			nativeName: "Diné bizaad, Dinékʼehǰí",
		},
		nb: {
			name: "Norwegian Bokmål",
			nativeName: "Norsk bokmål",
		},
		nd: {
			name: "North Ndebele",
			nativeName: "isiNdebele",
		},
		ne: {
			name: "Nepali",
			nativeName: "नेपाली",
		},
		ng: {
			name: "Ndonga",
			nativeName: "Owambo",
		},
		nn: {
			name: "Norwegian Nynorsk",
			nativeName: "Norsk nynorsk",
		},
		no: {
			name: "Norwegian",
			nativeName: "Norsk",
		},
		ii: {
			name: "Nuosu",
			nativeName: "ꆈꌠ꒿ Nuosuhxop",
		},
		nr: {
			name: "South Ndebele",
			nativeName: "isiNdebele",
		},
		oc: {
			name: "Occitan",
			nativeName: "Occitan",
		},
		oj: {
			name: "Ojibwe, Ojibwa",
			nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ",
		},
		cu: {
			name:
				"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
			nativeName: "ѩзыкъ словѣньскъ",
		},
		om: {
			name: "Oromo",
			nativeName: "Afaan Oromoo",
		},
		or: {
			name: "Oriya",
			nativeName: "ଓଡ଼ିଆ",
		},
		os: {
			name: "Ossetian, Ossetic",
			nativeName: "ирон æвзаг",
		},
		pa: {
			name: "Panjabi, Punjabi",
			nativeName: "ਪੰਜਾਬੀ, پنجابی‎",
		},
		pi: {
			name: "Pāli",
			nativeName: "पाऴि",
		},
		fa: {
			name: "Persian",
			nativeName: "فارسی",
		},
		pl: {
			name: "Polish",
			nativeName: "polski",
		},
		ps: {
			name: "Pashto, Pushto",
			nativeName: "پښتو",
		},
		pt: {
			name: "Portuguese",
			nativeName: "Português",
		},
		qu: {
			name: "Quechua",
			nativeName: "Runa Simi, Kichwa",
		},
		rm: {
			name: "Romansh",
			nativeName: "rumantsch grischun",
		},
		rn: {
			name: "Kirundi",
			nativeName: "kiRundi",
		},
		ro: {
			name: "Romanian, Moldavian, Moldovan",
			nativeName: "română",
		},
		ru: {
			name: "Russian",
			nativeName: "русский язык",
		},
		sa: {
			name: "Sanskrit (Saṁskṛta)",
			nativeName: "संस्कृतम्",
		},
		sc: {
			name: "Sardinian",
			nativeName: "sardu",
		},
		sd: {
			name: "Sindhi",
			nativeName: "सिन्धी, سنڌي، سندھی‎",
		},
		se: {
			name: "Northern Sami",
			nativeName: "Davvisámegiella",
		},
		sm: {
			name: "Samoan",
			nativeName: "gagana faa Samoa",
		},
		sg: {
			name: "Sango",
			nativeName: "yângâ tî sängö",
		},
		sr: {
			name: "Serbian",
			nativeName: "српски језик",
		},
		gd: {
			name: "Scottish Gaelic; Gaelic",
			nativeName: "Gàidhlig",
		},
		sn: {
			name: "Shona",
			nativeName: "chiShona",
		},
		si: {
			name: "Sinhala, Sinhalese",
			nativeName: "සිංහල",
		},
		sk: {
			name: "Slovak",
			nativeName: "slovenčina",
		},
		sl: {
			name: "Slovene",
			nativeName: "slovenščina",
		},
		so: {
			name: "Somali",
			nativeName: "Soomaaliga, af Soomaali",
		},
		st: {
			name: "Southern Sotho",
			nativeName: "Sesotho",
		},
		es: {
			name: "Spanish; Castilian",
			nativeName: "español, castellano",
		},
		su: {
			name: "Sundanese",
			nativeName: "Basa Sunda",
		},
		sw: {
			name: "Swahili",
			nativeName: "Kiswahili",
		},
		ss: {
			name: "Swati",
			nativeName: "SiSwati",
		},
		sv: {
			name: "Swedish",
			nativeName: "svenska",
		},
		ta: {
			name: "Tamil",
			nativeName: "தமிழ்",
		},
		te: {
			name: "Telugu",
			nativeName: "తెలుగు",
		},
		tg: {
			name: "Tajik",
			nativeName: "тоҷикӣ, toğikī, تاجیکی‎",
		},
		th: {
			name: "Thai",
			nativeName: "ไทย",
		},
		ti: {
			name: "Tigrinya",
			nativeName: "ትግርኛ",
		},
		bo: {
			name: "Tibetan Standard, Tibetan, Central",
			nativeName: "བོད་ཡིག",
		},
		tk: {
			name: "Turkmen",
			nativeName: "Türkmen, Түркмен",
		},
		tl: {
			name: "Tagalog",
			nativeName: "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔",
		},
		tn: {
			name: "Tswana",
			nativeName: "Setswana",
		},
		to: {
			name: "Tonga (Tonga Islands)",
			nativeName: "faka Tonga",
		},
		tr: {
			name: "Turkish",
			nativeName: "Türkçe",
		},
		ts: {
			name: "Tsonga",
			nativeName: "Xitsonga",
		},
		tt: {
			name: "Tatar",
			nativeName: "татарча, tatarça, تاتارچا‎",
		},
		tw: {
			name: "Twi",
			nativeName: "Twi",
		},
		ty: {
			name: "Tahitian",
			nativeName: "Reo Tahiti",
		},
		ug: {
			name: "Uighur, Uyghur",
			nativeName: "Uyƣurqə, ئۇيغۇرچە‎",
		},
		uk: {
			name: "Ukrainian",
			nativeName: "українська",
		},
		ur: {
			name: "Urdu",
			nativeName: "اردو",
		},
		uz: {
			name: "Uzbek",
			nativeName: "zbek, Ўзбек, أۇزبېك‎",
		},
		ve: {
			name: "Venda",
			nativeName: "Tshivenḓa",
		},
		vi: {
			name: "Vietnamese",
			nativeName: "Tiếng Việt",
		},
		vo: {
			name: "Volapük",
			nativeName: "Volapük",
		},
		wa: {
			name: "Walloon",
			nativeName: "Walon",
		},
		cy: {
			name: "Welsh",
			nativeName: "Cymraeg",
		},
		wo: {
			name: "Wolof",
			nativeName: "Wollof",
		},
		fy: {
			name: "Western Frisian",
			nativeName: "Frysk",
		},
		xh: {
			name: "Xhosa",
			nativeName: "isiXhosa",
		},
		yi: {
			name: "Yiddish",
			nativeName: "ייִדיש",
		},
		yo: {
			name: "Yoruba",
			nativeName: "Yorùbá",
		},
		za: {
			name: "Zhuang, Chuang",
			nativeName: "Saɯ cueŋƅ, Saw cuengh",
		},
		zu: {
			name: "Zulu",
			nativeName: "Zulu",
		},
	};

	engines = {
		google: {
			name: "Google",
			languages: [
				"af",
				"am",
				"ar",
				"az",
				"be",
				"bg",
				"bn",
				"bs",
				"ca",
				"ceb",
				"co",
				"cs",
				"cy",
				"da",
				"de",
				"el",
				"en",
				"eo",
				"es",
				"et",
				"eu",
				"fa",
				"fi",
				"fr",
				"fy",
				"ga",
				"gd",
				"gl",
				"gu",
				"ha",
				"haw",
				"hi",
				"hmn",
				"hr",
				"ht",
				"hu",
				"hy",
				"id",
				"ig",
				"is",
				"it",
				"iw",
				"ja",
				"jv",
				"ka",
				"kk",
				"km",
				"kn",
				"ko",
				"ku",
				"ky",
				"la",
				"lb",
				"lo",
				"lt",
				"lv",
				"mg",
				"mi",
				"mk",
				"ml",
				"mn",
				"mr",
				"ms",
				"mt",
				"my",
				"ne",
				"nl",
				"no",
				"ny",
				"or",
				"pa",
				"pl",
				"ps",
				"pt",
				"ro",
				"ru",
				"rw",
				"sd",
				"si",
				"sk",
				"sl",
				"sm",
				"sn",
				"so",
				"sq",
				"sr",
				"st",
				"su",
				"sv",
				"sw",
				"ta",
				"te",
				"tg",
				"th",
				"tk",
				"tl",
				"tr",
				"tt",
				"ug",
				"uk",
				"ur",
				"uz",
				"vi",
				"xh",
				"yi",
				"yo",
				"zu",
			],
			lastTime: 0,
			lastRatelimit: 0,
			ratelimit: 1000,
		},
	};

	translate = async (text, language, engine, async = true) => {
		if (!this.engines[engine]) return;

		const started = Date.now();

		const lastTime = this.engines[engine].lastTime;
		this.engines[engine].lastTime = started;

		const timeout =
			lastTime +
				this.engines[engine].ratelimit +
				this.engines[engine].lastRatelimit <
			started
				? 0
				: this.engines[engine].ratelimit +
				  this.engines[engine].lastRatelimit -
				  (started - lastTime);

		this.engines[engine].lastRatelimit = timeout;

		const createWindow = () => {
			const window = new BrowserWindow({
				show: false,
				webPreferences: {
					nodeIntegration: true,
					nodeIntegrationInWorker: true,
				},
			});
			window.webContents.openDevTools();
			return window;
		};

		const translateFunctions = {
			google: (text, language) => {
				return new Promise((resolve, reject) => {
					translatte(text, {
						to: language,
						agents: randomUseragent.getAll(),
					})
						.then((res) => {
							resolve({
								text: res.text,
								originalLanguage: res.from.language.iso,
							});
						})
						.catch((err) => {
							reject(err);
						});
					// const window = createWindow();
					// window.webContents.on("did-finish-load", () => {
					// 	ipc.on(
					// 		"message-translate-translation",
					// 		(event, message) => {
					// 			try {
					// 				window.close();
					// 			} catch {}
					// 			if (message) resolve(message);
					// 			reject();
					// 		}
					// 	);
					// 	window.webContents.executeJavaScript(`
					// 		require("electron").ipcRenderer.sendTo(${
					// 			remote.getCurrentWindow().webContents.id
					// 		}, "message-translate-translation", (document.querySelector(".translation") || {}).innerText);
					// 	`);
					// });
					// window.loadURL(
					// 	`https://translate.google.com/#auto/${language}/${encodeURIComponent(
					// 		text
					// 	)}`
					// );
				});
			},
		};

		let translatePromise = (resolve, reject) => {
			setTimeout(async () => {
				const finished = Date.now();

				const excepted = this.removeExceptions(text);
				let translationResults;
				let tries = 0;

				while (!translationResults && tries < 3) {
					tries++;
					try {
						translationResults = await translateFunctions[engine](
							excepted.text,
							language
						);
					} catch (e) {}
				}

				if (!translationResults) reject();

				translationResults.text = this.addExceptions(
					translationResults.text,
					excepted.exceptions
				);

				resolve(translationResults);
			}, timeout);
		};

		if (async) {
			return await new Promise(translatePromise);
		}
		return new Promise(translatePromise);
	};

	translateMessage = async (message, language, engine, async = true) => {
		if (!message.content || message.content.length === 0) {
			return "";
		}
		// If any of the properties don't exist, make them.
		if (!this.cache[message.channel_id]) {
			this.cache[message.channel_id] = {};
		}
		let alreadyTranslated = true;
		if (!this.cache[message.channel_id][message.id]) {
			alreadyTranslated = false;
			this.cache[message.channel_id][message.id] = {
				channelID: message.channel_id,
				currentLanguage: "original",
				originalLanguage: null,
				engines: {},
				originalContent: message.content,
			};
		}
		if (!this.cache[message.channel_id][message.id].engines[engine]) {
			this.cache[message.channel_id][message.id].engines[engine] = {};
		}
		if (
			!this.cache[message.channel_id][message.id].engines[engine][
				language
			]
		) {
			this.cache[message.channel_id][message.id].engines[engine][
				language
			] = {};
		}

		// If the target language is the original language, set it back.

		// If the target language is cached, use it.
		if (language == "original") {
			this.cache[message.channel_id][message.id].currentLanguage =
				"original";
			message.content = this.cache[message.channel_id][
				message.id
			].originalContent;
		} else if (
			this.cache[message.channel_id][message.id].engines[engine][language]
				.content
		) {
			this.cache[message.channel_id][
				message.id
			].currentLanguage = language;
			message.content = this.cache[message.channel_id][
				message.id
			].engines[engine][language].content;
		} else if (!alreadyTranslated) {
			const translatePromise = (resolve, reject) => {
				this.translate(message.content, language, engine, async)
					.then((results) => {
						message.content = results.text;
						if (
							this.cache[message.channel_id][message.id]
								.originalLanguage === null
						)
							this.cache[message.channel_id][
								message.id
							].originalLanguage = results.originalLanguage;

						this.cache[message.channel_id][
							message.id
						].currentLanguage = language;
						this.cache[message.channel_id][message.id].engines[
							engine
						][language].content = results.text;

						this.updateMessage(message);

						resolve(message);
					})
					.catch((e) => {
						reject(e);
					});
			};

			if (async) {
				return await new Promise(translatePromise);
			}
			return new Promise(translatePromise);
		}

		if (async) {
			return await new Promise((resolve) => {
				this.updateMessage(message);
				resolve(message);
			});
		}
		return new Promise((resolve) => {
			this.updateMessage(message);
			resolve(message);
		});
	};

	updateMessage(message) {
		FluxDispatcher.dirtyDispatch({
			translation: true,
			type: "MESSAGE_UPDATE",
			message,
		});
	}

	clearCache = () => {
		for (let channelID in this.cache) {
			for (let messageID in this.cache[channelID]) {
				this.removeMessage(channelID, messageID);
			}
		}
		this.cache = {};
	};

	removeMessage = (channelID, messageID, reset = true) => {
		let message = getMessage(channelID, messageID);
		if (reset) {
			message.content = this.cache[channelID][messageID].originalContent;
			this.updateMessage(message);
		}
		delete this.cache[channelID][messageID];
	};
}

module.exports = Translator;
