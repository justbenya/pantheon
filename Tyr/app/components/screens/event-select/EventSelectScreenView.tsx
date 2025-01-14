import * as React from "react";
import './event-select.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import classNames from 'classnames';
import {LEventsList} from "#/interfaces/local";
import {useContext} from "react";
import {i18n} from "#/components/i18n";
import {Icon} from "#/components/general/icon/Icon";
import {IconType} from "#/components/general/icon/IconType";

interface IProps {
  playerName: string;
  events: LEventsList;
  currentEvent: number | undefined;
  onBackClick: () => void;
  onSettingClick: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const EventSelectScreenView = React.memo(function (props: IProps) {
  const loc = useContext(i18n);
  const {
    playerName,
    events,
    onBackClick,
    onSettingClick,
    onSelectEvent,
    currentEvent
  } = props;

  return (
    <div className="flex-container page-event-select">
      <div className="flex-container__content">
        <div className="top-panel top-panel--between">
          {events.length > 0
            ? <div className="svg-button" onClick={onBackClick}>
                <Icon type={IconType.BACK} />
              </div>
            : null}
          <div className="svg-button svg-button--small" onClick={onSettingClick}>
            <Icon type={IconType.SETTINGS} />
          </div>
        </div>
        <div className="page-event-select__name">{playerName}</div>
        <div className="page-event-select__section">
          {events.length > 0
            ? <>
                <div className="page-event-select__section-title">{loc._t('Select event')}</div>
                <div className="page-event-select__section-content">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className={classNames('radio-menuitem', {'radio-menuitem--active': event.id === currentEvent})}
                      onClick={() => onSelectEvent(event.id)}
                    >{event.title}</div>
                  ))}
                </div>
              </>
            : <div style={{ textAlign: 'center' }}>{loc._t('There is no events you participate in right now')}</div>
            }
        </div>
      </div>
    </div>
  );
})
