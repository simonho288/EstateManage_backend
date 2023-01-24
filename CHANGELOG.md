

## [0.9.6](https://github.com/simonho288/estateman_backend/compare/v0.9.5...v0.9.6) (2023-01-24)


### Features

* frontend unit test added autolist testing ([2c59a96](https://github.com/simonho288/estateman_backend/commit/2c59a9610b88efe279e7dec7bece43e17c790b7d))
* frontend unit test added autoreport testing ([ed6ca28](https://github.com/simonho288/estateman_backend/commit/ed6ca28a759bf9b0e0ad22da0bdddce872594e2d))
* frontend unit test added util.ts testing ([f7cd9bc](https://github.com/simonho288/estateman_backend/commit/f7cd9bc1ceb00bb60aedc476e0f7393bbb4a064d))

## [0.9.5](https://github.com/simonho288/estateman_backend/compare/v0.9.4...v0.9.5) (2023-01-20)


### Features

* added basic frontend testing for admin console ([bc9baf5](https://github.com/simonho288/estateman_backend/commit/bc9baf572db02a2766da6edd89b410a7b1ef6afb))
* added frontend ajax and autoform testings ([00cbf50](https://github.com/simonho288/estateman_backend/commit/00cbf5051bd52481b110011b087610b632c44554))


### Bug Fixes

* bug when add new tenant and can't display ([2049cf4](https://github.com/simonho288/estateman_backend/commit/2049cf410dda91f150c35ef4550e60764d18f051))

## [0.9.4](https://github.com/simonho288/estateman_backend/compare/v0.9.3...v0.9.4) (2023-01-19)


### Features

* added unit test for testing 'util.ts' ([c3e9cb3](https://github.com/simonho288/estateman_backend/commit/c3e9cb3a12a7828896c9c5c470be2eea0a5bee51))


### Bug Fixes

* added back the missing testings for user-logged-in level ([39391c6](https://github.com/simonho288/estateman_backend/commit/39391c6e635a2d044abdd8805327eb3b5a0559c3))
* enable all levels of testings ([3bf70da](https://github.com/simonho288/estateman_backend/commit/3bf70daa03623f56ecf1fe8c1fb40e725f9114f7))

## [0.9.3](https://github.com/simonho288/estateman_backend/compare/v0.9.2...v0.9.3) (2023-01-18)


### Features

* added user-logged-in testings ([b9648bf](https://github.com/simonho288/estateman_backend/commit/b9648bfb62f751c85eb3452b2abe93cf47d4b1f9))

## [0.9.2](https://github.com/simonho288/estateman_backend/compare/v0.9.1...v0.9.2) (2023-01-17)


### Features

* added ts type for all apis parameters ([a77532d](https://github.com/simonho288/estateman_backend/commit/a77532d2d4c8750df49f41a25491460410a83f73))
* tenant-logged-in testings done ([297f7ee](https://github.com/simonho288/estateman_backend/commit/297f7ee9ff846b0c6863f8abd48f78042dbc94b9))


### Bug Fixes

* modify all model getall(), the param pageno & pagesize to number ([8295c05](https://github.com/simonho288/estateman_backend/commit/8295c05f1cc22aa95055eebc97b8a34bc0302c6a))

## [0.9.1](https://github.com/simonho288/estateman_backend/compare/v0.9.0...v0.9.1) (2023-01-16)


### Features

* non-logged-in testings done ([71e8f94](https://github.com/simonho288/estateman_backend/commit/71e8f94a4b6ebdfc0709b5c20c0ccdabd6d35970))

## [0.9.0](https://github.com/simonho288/estateman_backend/compare/v0.8.1...v0.9.0) (2023-01-16)


### Features

* added basic setup for backend api unit testing ([c9a935a](https://github.com/simonho288/estateman_backend/commit/c9a935a0bae588276e42f3f701149e49f66db2f4))

## [0.8.1](https://github.com/simonho288/estateman_backend/compare/v0.8.0...v0.8.1) (2023-01-16)


### Features

* change 'set amenity booking api' to support muli-status ([82529ed](https://github.com/simonho288/estateman_backend/commit/82529ed37c8279ea2d889cf479f8413d31c4dcf8))


### Bug Fixes

* fix the date informal format when creating sample data in insertothers ([b90d08e](https://github.com/simonho288/estateman_backend/commit/b90d08e42e153f77f741b9cade436f6038d6e9bf))
* the tenAmenBkg status typo error ([70e8ff7](https://github.com/simonho288/estateman_backend/commit/70e8ff7254a2757d7cd565fdf37f49afb4764887))

## [0.8.0](https://github.com/simonho288/estateman_backend/compare/v0.7.0...v0.8.0) (2023-01-13)


### Features

* add logging to all functions and routers for easily debugging ([0cc2bb0](https://github.com/simonho288/estateman_backend/commit/0cc2bb033a407f073c00857a173b3c26fc0e3996))
* added amenity booking 'confirm' handling for admin and api ([472bc63](https://github.com/simonho288/estateman_backend/commit/472bc6310f238b1e19eb8d31331075d29658bb8e))

## [0.7.0](https://github.com/simonho288/estateman_backend/compare/v0.6.0...v0.7.0) (2023-01-12)


### Features

* add 'break' for release-it to create breaking changes section ([11dc2ef](https://github.com/simonho288/estateman_backend/commit/11dc2ef90c12abf60967c566d25362f78da59b0d))
* add release-it config json file ([b40355f](https://github.com/simonho288/estateman_backend/commit/b40355fb91a0e5370daf8dd3cb87b806a31e03eb))
* added api for amenity booking ([e40adf6](https://github.com/simonho288/estateman_backend/commit/e40adf691b0d5e05e33a302adb890e44dc675d2d))
* added new ts type definition for loopmeta ([c654d69](https://github.com/simonho288/estateman_backend/commit/c654d69de9520da262329b8be43cecaa67825d89))
* all exception handling dump the stack in backend ([2580a1d](https://github.com/simonho288/estateman_backend/commit/2580a1d2884dd8cbd14e937e3d49d6083fe5ca0b))
* booking ts type is improved ([83de2fa](https://github.com/simonho288/estateman_backend/commit/83de2fa777e0b6398b58b0671a53a15a428280dd))


### Bug Fixes

* amenity booking sample record correction ([edf2cb9](https://github.com/simonho288/estateman_backend/commit/edf2cb96bd100603f7f978e76581e7fc82d9cc59))
* bug in /getdashboarddata is fixed ([9c7ac69](https://github.com/simonho288/estateman_backend/commit/9c7ac69a644d05426aa86c2070addbf085ebb892))
* change model some field type to enum ([1a75da9](https://github.com/simonho288/estateman_backend/commit/1a75da90f552e48198aca30194125b67fbceb8b6))

## [0.6.0](https://github.com/simonho288/estateman_backend/compare/v0.5.0...v0.6.0) (2023-01-09)


### Features

* admin console add html editor ([f52bd36](https://github.com/simonho288/estateman_backend/commit/f52bd362d26a98233219107a2c6e83aa081468c4))
* estate schema add 'website' field ([49d7477](https://github.com/simonho288/estateman_backend/commit/49d7477d7f43b7b514d65760f87b20d8737b3bb9))


### Bug Fixes

* all models getall() & getbyid() reduce redundant codes ([48a9b1d](https://github.com/simonho288/estateman_backend/commit/48a9b1d8fad3449038af33b659a47d14d58b151b))
* bug at admin console when checkbox save error ([56e941d](https://github.com/simonho288/estateman_backend/commit/56e941d5d855d534f913d9188cdc154bc7c38e79))

## [0.5.0](https://github.com/simonho288/estateman_backend/compare/v0.4.0...v0.5.0) (2023-01-05)


### Features

* [#2](https://github.com/simonho288/estateman_backend/issues/2) and [#3](https://github.com/simonho288/estateman_backend/issues/3) are done ([3d1e55f](https://github.com/simonho288/estateman_backend/commit/3d1e55f30aa61d32d18f3f9b9a6bae5cb9e32a5f))

## [0.4.0](https://github.com/simonho288/estateman_backend/compare/v0.3.0...v0.4.0) (2023-01-04)


### Features

* add api for tenant app to scan unit qrcode ([0773c14](https://github.com/simonho288/estateman_backend/commit/0773c14b20311e800a15245f61553176b9f2b7cc))
* add mobile app repo hyperlink ([1e122ed](https://github.com/simonho288/estateman_backend/commit/1e122ed8990fe4e6c3f32dc66f9ad15cb7bd679b))


### Bug Fixes

* readme minor changes ([18d2a25](https://github.com/simonho288/estateman_backend/commit/18d2a25ca91cf5a04c83793d52ee9fce35909c4f))

## [0.3.0](https://github.com/simonho288/estateman_backend/compare/v0.2.0...v0.3.0) (2023-01-02)


### Features

* add .dev.var in readme & sample wrangler.toml ([a95b442](https://github.com/simonho288/estateman_backend/commit/a95b442bd018f9b36d5afbc983b5e1e5c54c0ad4))


### Bug Fixes

* accurate the setup instruction in README ([09fa00b](https://github.com/simonho288/estateman_backend/commit/09fa00b6fba5dc51f253fc3d2e4e586fe42503f7))
* Fix installation bugs for development installation ([34d05b8](https://github.com/simonho288/estateman_backend/commit/34d05b86b26b287dc1bc2961b70be2511cb6f920))

## [0.2.0](https://github.com/simonho288/estateman_backend/compare/v0.1.0...v0.2.0) (2022-12-29)


### Features

* add package "release-it" for release management ([a93843a](https://github.com/simonho288/estateman_backend/commit/a93843a42fde8e51e5b346894fc7e1945068ede8))


### Bug Fixes

* add missing files for release-it ([ac170b2](https://github.com/simonho288/estateman_backend/commit/ac170b2b0e1434fa7544b04c7b73a1983ba65dea))