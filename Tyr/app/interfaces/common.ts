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

import { YakuId } from '#/primitives/yaku';
import { I18nService } from '#/services/i18n';

export type Outcome = 'ron' | 'tsumo' | 'draw' | 'abort' | 'chombo' | 'nagashi';

export interface Yaku {
  id: YakuId;
  name: (i18n: I18nService) => string;
  shortName: (i18n: I18nService) => string;
  yakuman: boolean;
  // valueMelded: number; // TODO
  // valueConcealed: number;
  disabled?: boolean;
}

export interface Player {
  id: number;
  displayName: string;
  score: number;
  penalties: number;
}

export interface Table {
  index?: number;
  hash: string;
  currentRound: number;
  players: Player[];
}
