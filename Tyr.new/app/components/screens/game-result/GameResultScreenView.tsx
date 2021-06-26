import * as React from "react";
import './page-game-result.css'
import classNames from 'classnames';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = {
  showRepeatButton?: boolean
  players: PlayerScore[]
  onCheckClick: () => void
  onRepeatClick: () => void
}

export type PlayerScore = {
  name: string
  score: number
  delta: number
}

export class GameResultScreenView extends React.Component<IProps> {
  render() {
    const {players, showRepeatButton, onCheckClick, onRepeatClick} = this.props;

    return (
      <div className="page-game-result">
        <div className="page-game-result__players">
          {players.map((player, i) => (
            <div key={i} className="player-result">
              <div className="player-result__name">
                {player.name}
              </div>
              <div className="player-result__score-container">
                <div className="player-result__score">
                  {player.score}
                </div>
                <div className={classNames(
                  'player-result__delta',
                  {'player-result__delta--danger': player.delta < 0},
                  {'player-result__delta--success': player.delta > 0}
                )}>
                  {player.delta <= 0 ? player.delta : '+' + player.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="page-game-result__buttons">
          {showRepeatButton && (
            <>
              <div className="flat-btn flat-btn--medium" onClick={onRepeatClick}>
                <Icon type={IconType.REPEAT} />
              </div>
              <div className="flat-btn flat-btn--medium" onClick={onCheckClick}>
                <Icon type={IconType.SAVE} />
              </div>
            </>
          )}
          {!showRepeatButton && (
            <div className="flat-btn flat-btn--large" onClick={onCheckClick}>
              <Icon type={IconType.SAVE} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
