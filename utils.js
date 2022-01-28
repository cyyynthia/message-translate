/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { Engines, IsoLangs } = require("./constants");

module.exports = {
  languagesForEngine(engine) {
    if (!Engines[engine]) return null

    return Engines[engine].languages.map((language) => {
      if (IsoLangs[language]) {
        return {
          label: IsoLangs[language].nativeName !== IsoLangs[language].name
            ? `${IsoLangs[language].name} | ${IsoLangs[language].nativeName}`
            : IsoLangs[language].nativeName,
          value: language,
        };
      }
      return {
        label: language,
        value: language,
      };
    });
  }
};
