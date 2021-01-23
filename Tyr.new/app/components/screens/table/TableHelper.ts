import {IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';
import {
  getKamicha, getSeatKamicha, getSeatSelf, getSeatShimocha,
  getSeatToimen, getShimocha, getSelf,
  getToimen,
  RoundPreviewSchemePurpose,
} from '#/store/selectors/roundPreviewSchemeSelectors';
import {PlayerButtonMode, PlayerPointsMode} from '#/components/types/PlayerEnums';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {ItemSelect} from '#/components/general/select-modal/ItemSelect';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';
import {
  ADD_ROUND_INIT,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  INIT_BLANK_OUTCOME, TOGGLE_LOSER, TOGGLE_RIICHI,
  TOGGLE_WINNER,
  UPDATE_CURRENT_GAMES_INIT,
} from '#/store/actions/interfaces';
import {Outcome, Player} from '#/interfaces/common';
import {
  paoPressed,
  showDeadButton,
  showLoseButton, showNagashiButton,
  showPaoButton,
  showRiichiButton,
  showWinButton,
  winPressed,
  losePressed,
  riichiPressed,
  deadPressed,
  nagashiPressed,
  winDisabled,
  loseDisabled,
  nagashiDisabled
} from '#/store/selectors/userItemSelectors';
import {PlayerButtonProps} from '#/components/types/PlayerButtonProps';
import {TableMode} from '#/components/types/TableMode';
import {mayGoNextFromPlayersSelect} from '#/store/selectors/navbarSelectors';
import {PlayerArrow, PlayerSide, ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {roundToString} from '#/components/helpers/Utils';

export function getPlayerTopInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state);
  const playerBase = getToimen(state, purpose);
  const wind = getSeatToimen(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerLeftInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getKamicha(state, purpose)
  const wind = getSeatKamicha(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerRightInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getShimocha(state, purpose)
  const wind = getSeatShimocha(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getPlayerBottomInfo(state: IAppState, dispatch: Dispatch) {
  const purpose = getPurposeForType(state)
  const playerBase = getSelf(state, purpose)
  const wind = getSeatSelf(state, purpose);

  return getPlayer(playerBase, wind, state, dispatch)
}

export function getOutcomeModalInfo(state: IAppState, dispatch: Dispatch): SelectModalProps | undefined {
  if (state.currentScreen !== 'outcomeSelect') {
    return undefined
  }

  const onItemSelect = (outcome: Outcome) => {
    dispatch({ type: INIT_BLANK_OUTCOME, payload: outcome });
    dispatch({ type: GOTO_NEXT_SCREEN });
  }

  const items: ItemSelect[] = [
    {
      text: 'Ron',
      onSelect: () => {onItemSelect('ron')},
    },
    {
      text: 'Tsumo',
      onSelect: () => {onItemSelect('tsumo')},
    },
    {
      text: 'Exhaustive draw',
      onSelect: () => {onItemSelect('draw')},
    },
    {
      text: 'Abortive draw',
      onSelect: () => {onItemSelect('abort')},
      unavailable: false,
    },
    {
      text: 'Nagashi mangan',
      onSelect: () => {onItemSelect('nagashi')},
      unavailable: false,
    },
    {
      text: 'Chombo',
      onSelect: () => {onItemSelect('chombo')},
    },
  ];

  return {
    items: items,
    onHide: () => {dispatch({ type: GOTO_PREV_SCREEN });},
  }
}

function getPurposeForType(state: IAppState) {
  let purpose: RoundPreviewSchemePurpose = 'overview'
  // switch (type) {
  //   case TableType.SELECT_OUTCOME:
  //     purpose = ''
  //     break
  //
  // }
  return purpose
}

function getPlayer(player: Player, wind: string, state: IAppState, dispatch: Dispatch): PlayerProps {
  let rotated = false; //todo singleDeviceMode
  let pointsMode = PlayerPointsMode.IDLE; //todo check
  let points: number | undefined = player.score;
  let penaltyPoints: number | undefined = player.penalties; //todo check
  let inlineWind = true;
  let winButton: PlayerButtonProps | undefined = undefined;
  let loseButton: PlayerButtonProps | undefined = undefined;
  let riichiButton: PlayerButtonProps | undefined = undefined;
  let showDeadButton = false;

  switch (state.currentScreen) {
    case 'playersSelect':
      points = undefined;
      penaltyPoints = undefined;

      let winButtonMode: PlayerButtonMode;
      if (winPressed(state, player)) {
        winButtonMode = PlayerButtonMode.PRESSED
      } else if (winDisabled(state, player)) {
        winButtonMode = PlayerButtonMode.DISABLE
      } else {
        winButtonMode = PlayerButtonMode.IDLE
      }
      winButton = {
        mode: winButtonMode,
        onClick: onWinButtonClick(dispatch, player.id),
      }

      let loseButtonMode: PlayerButtonMode;
      if (losePressed(state, player)) {
        loseButtonMode = PlayerButtonMode.PRESSED
      } else if (loseDisabled(state, player)) {
        loseButtonMode = PlayerButtonMode.DISABLE
      } else {
        loseButtonMode = PlayerButtonMode.IDLE
      }
      loseButton = {
        mode: loseButtonMode,
        onClick: onLoseButtonClick(dispatch, player.id),
      }

      let riichiButtonMode: PlayerButtonMode;
      if (riichiPressed(state, player)) {
        riichiButtonMode = PlayerButtonMode.PRESSED
      } else {
        riichiButtonMode = PlayerButtonMode.IDLE
      }
      riichiButton = {
        mode: riichiButtonMode,
        onClick: onRiichiButtonClick(dispatch, player.id),
      }
      break;
  }



  return {
    name: player.displayName,
    wind: wind,
    points: points,
    penaltyPoints: penaltyPoints,
    pointsMode: pointsMode,
    rotated: rotated,
    inlineWind: inlineWind,
    winButton: winButton,
    loseButton: loseButton,
    riichiButton: riichiButton,
    showDeadButton: showDeadButton,
  }
}

export function getBottomPanel(state: IAppState, dispatch: Dispatch) {
  const tableMode = getTableMode(state)
  const selectedOutcome = state.currentOutcome && state.currentOutcome.selectedOutcome

  const text = selectedOutcome; //todo

  const showBack = tableMode === TableMode.SELECT_PLAYERS || tableMode ===  TableMode.RESULT;
  const showNext = tableMode === TableMode.SELECT_PLAYERS;
  const isNextDisabled = !canGoNext(state);
  const showSave = tableMode === TableMode.RESULT;
  const isSaveDisabled = false; //todo do we really need disabled state for save? seems no

  const showHome = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
  const showRefresh = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
  const showAdd = tableMode === TableMode.GAME;
  const showLog = [TableMode.GAME, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);

  return {
    text: text,
    showBack: showBack,
    showNext: showNext,
    isNextDisabled: isNextDisabled,
    showHome: showHome,
    showRefresh: showRefresh,
    showAdd: showAdd,
    showLog: showLog,
    showSave: showSave,
    isSaveDisabled: isSaveDisabled,
    onNextClick: onNextClick(dispatch),
    onBackClick: onBackClick(dispatch),
    onSaveClick: onSaveClick(state, dispatch),
    onLogClick: onLogClick(dispatch),
    onAddClick: onAddClick(state, dispatch),
    onHomeClick: onHomeClick(dispatch),
    onRefreshClick: onRefreshClick(dispatch),
  }
}

function canGoNext(state: IAppState) {
  return mayGoNextFromPlayersSelect(state) //todo
}

function getTableMode(state: IAppState): TableMode {
  switch (state.currentScreen) {
    case 'currentGame':
      return TableMode.GAME;
    case 'confirmation':
      return TableMode.RESULT;
    default: //todo
      return TableMode.SELECT_PLAYERS;
  }
}

export function getTableInfo(state: IAppState): TableInfoProps | undefined {
  if (state.currentScreen === 'confirmation') {
    return undefined;
  }

  return {
    showRoundInfo: true,
    showTableNumber: false,
    showTimer: false,
    gamesLeft: undefined,
    round: roundToString(state.currentRound),
    honbaCount: state.honba,
    riichiCount: state.riichiOnTable,
    currentTime: undefined,
    tableNumber: undefined,
  }
}


type paymentObject = {
  from: number,
  to: number,
  amount: number,
}
function getObjectFromPayment(payment: {[key: string]: number }): paymentObject[] {
  const result: paymentObject[] = [];
  Object.keys(payment).forEach(paymentItem => {
    const players = paymentItem.split('<-');

    if (players.length === 2) {
      const item = {
        from: parseInt(players[1], 10),
        to: parseInt(players[0], 10),
        amount: payment[paymentItem]
      };
      result.push(item)
    }
  })

  return result;
}

export function getArrowsInfo(state: IAppState): ResultArrowsProps | undefined {
  const changesOverview = state.changesOverview;
  if (state.currentScreen !== 'confirmation' || changesOverview === undefined || state.loading.overview) {
    return undefined;
  }

  const payments = changesOverview.payments;
  const directPayments = getObjectFromPayment(payments.direct);
  const riichiPayments = getObjectFromPayment(payments.riichi);
  const honbaPayments = getObjectFromPayment(payments.honba);

  // const playersBySide: Record<PlayerSide, Player> = {
  //   [PlayerSide.TOP]: getToimen(state, 'confirmation'),
  //   [PlayerSide.LEFT]: getKamicha(state, 'confirmation'),
  //   [PlayerSide.RIGHT]: getShimocha(state, 'confirmation'),
  //   [PlayerSide.BOTTOM]: getSelf(state, 'confirmation'),
  // };

  const sideByPlayer: Record<number, PlayerSide> = {
    [getToimen(state, 'confirmation').id]: PlayerSide.TOP,
    [getKamicha(state, 'confirmation').id]: PlayerSide.LEFT,
    [getShimocha(state, 'confirmation').id]: PlayerSide.RIGHT,
    [getSelf(state, 'confirmation').id]: PlayerSide.BOTTOM,
  };

  const arrows: PlayerArrow[] = []
  directPayments.forEach(item => {
    const start = sideByPlayer[item.from]
    const end = sideByPlayer[item.to]

    const playerArrow: PlayerArrow = {
      points: item.amount,
      honbaPoints: 0,
      withRiichi: false,
      withPao: false,
      start: start,
      end: end,
    }

    arrows.push(playerArrow)
  })

  riichiPayments.forEach(item => {
    if (item.amount !== 0) {
      const start = sideByPlayer[item.from]
      const end = sideByPlayer[item.to]

      const currentArrow = arrows.find(arrow => arrow.start === start && arrow.end === end)
      if (currentArrow) {
        currentArrow.withRiichi = true
      } else {
        const playerArrow: PlayerArrow = {
          points: 0,
          honbaPoints: 0,
          withRiichi: true,
          withPao: false,
          start: start,
          end: end,
        }

        arrows.push(playerArrow)
      }
    }
  })

  honbaPayments.forEach(item => {
    const start = sideByPlayer[item.from]
    const end = sideByPlayer[item.to]

    const currentArrow = arrows.find(arrow => arrow.start === start && arrow.end === end)
    if (currentArrow) {
      currentArrow.honbaPoints = item.amount
    }
  })

  //todo pao

  return {
      arrows: arrows
    };
}

///////////////
// events
//////////////

function onWinButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_WINNER, payload: playerId })
}

function onLoseButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_LOSER, payload: playerId })
}

function onRiichiButtonClick(dispatch: Dispatch, playerId: number) {
  return () => dispatch({ type: TOGGLE_RIICHI, payload: playerId })
}

function onLogClick(dispatch: Dispatch) {
  //todo
  return () => {
    console.log('onLogClick')
  }
}

function onAddClick(state: IAppState, dispatch: Dispatch) {
  return () => {
    if (state.currentScreen === 'currentGame') {
      dispatch({ type: GOTO_NEXT_SCREEN });
    } else if (state.currentScreen === 'outcomeSelect') {
      dispatch({ type: GOTO_PREV_SCREEN });
    }
  }
}

function onHomeClick(dispatch: Dispatch) {
  return () => dispatch({ type: GOTO_PREV_SCREEN });
}

function onRefreshClick(dispatch: Dispatch) {
  return () => dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
}

function onNextClick(dispatch: Dispatch) {
  return () => {
    dispatch({ type: GOTO_NEXT_SCREEN });
  };
}

function onBackClick(dispatch: Dispatch) {
  return () => dispatch({ type: GOTO_PREV_SCREEN });
}

function onSaveClick(state: IAppState, dispatch: Dispatch) {
  return () => dispatch({ type: ADD_ROUND_INIT, payload: state })
}
