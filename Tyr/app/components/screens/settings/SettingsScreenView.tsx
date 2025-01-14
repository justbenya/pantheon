import * as React from "react";
import './page-setting.css'
// import {Switch} from '#/components/general/switch/Switch';
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import classNames from 'classnames';
import {Theme} from '#/services/themes';
import {useContext} from "react";
import {i18n} from "#/components/i18n";

interface IProps {
  playerName: string;
  supportedLanguages: string[];
  currentLanguage: string;
  supportedThemes: Theme[];
  currentTheme: string;
  singleDeviceMode: boolean;
  onLogout: () => void;
  onBackClick: () => void;
  onSingleDeviceModeChange: () => void;
  onLangChange: (lang: string) => void;
  onThemeSelect: (theme: string) => void;
  onEventSelect: () => void;
}

export const SettingsScreenView = React.memo(function (props: IProps) {
  const loc = useContext(i18n);
  const {
    playerName,
    supportedLanguages,
    currentLanguage,
    supportedThemes,
    currentTheme,
    // singleDeviceMode,
    onLogout,
    onBackClick,
    // onSingleDeviceModeChange,
    onLangChange,
    onThemeSelect,
    onEventSelect,
  } = props;

  return (
    <div className="flex-container page-setting">
      <div className="flex-container__content">
        <TopPanel onBackClick={onBackClick}/>
        <div className="page-setting__name">{playerName}</div>
        <div className="page-setting__section">
          <div className="page-setting__section-title">{loc._t('Language')}</div>
          <div className="page-setting__section-content">
            {supportedLanguages.map(lang => (
              <div
                key={lang}
                className={classNames('radio-btn radio-btn--small', {'radio-btn--active': lang === currentLanguage})}
                onClick={() => onLangChange(lang)}
              >{lang}</div>
            ))}
          </div>
        </div>
        <div className="page-setting__section">
          <div className="page-setting__section-title">{loc._t('Theme')}</div>
          <div className="page-setting__section-content">

            {supportedThemes.map(theme => (
              <div key={theme.name} className={classNames('theme', {'theme--selected': theme.name === currentTheme})}>
                <div className="theme__visual" onClick={() => onThemeSelect(theme.name)}>
                  <div className="theme__visual-inner" style={{backgroundColor: theme.backgroundColor}}>
                    <div className="theme__secondary-color" style={{backgroundColor: theme.secondaryColor}} />
                    <div className="theme__text-color" style={{backgroundColor: theme.textColor}} />
                    <div className="theme__primary-color" style={{backgroundColor: theme.primaryColor}} />
                  </div>
                </div>
                <div className="theme__name">{theme.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="page-setting__section">
          <div className="page-setting__section-content">
            <button className="flat-btn flat-btn--large"
                    style={{ width: '100%' }}
                    onClick={() => onEventSelect()}>{loc._t('Select another event')}</button>
          </div>
        </div>
        {/*<div className="page-setting__section">*/}
        {/*  <div className="switch-setting">*/}
        {/*    <Switch switched={singleDeviceMode} onToggle={onSingleDeviceModeChange}/>*/}
        {/*    <div className="switch-setting__description">*/}
        {/*      <div className="switch-setting__caption">Single device mode</div>*/}
        {/*      <div className="switch-setting__info">Turn on if you use one device on table during the game</div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
      <div className="flex-container__bottom page-setting__bottom" onClick={onLogout}>
        <div className="link">{loc._t('Log out')}</div>
      </div>
    </div>
  );
})
