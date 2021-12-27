/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import {EnvConfig} from "#/envConfig/interface";

export const environment: EnvConfig = {
  production: false,
  apiUrl: 'http://192.168.1.5:4001',
  uaUrl: 'http://192.168.1.5:4004',
  guiUrl: 'http://192.168.1.5:4002',
  guiFix: (src: string) => src.replace('http://localhost:4002', '192.168.1.5:4002'),
  idbTokenKey: 'pantheon_authToken',
  idbIdKey: 'pantheon_currentPersonId',
  idbEventKey: 'pantheon_currentEventId',
  idbLangKey: 'pantheon_currentLanguage',
  idbThemeKey: 'pantheon_currentTheme',
  cookieDomain: null, // when working on localhost this must be omitted!
  metrikaId: 101010101, // dummy number for testing

  // Do not change this unless you really know what are you doing
  apiVersion: [1, 0]
};
