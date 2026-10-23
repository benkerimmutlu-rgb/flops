import { roomIcon, posePicture, depthPicture } from './room-icons.js';

const action = (id: string, label: string, picture: string, hidden = false) => `<button type="button" id="${id}" class="room-action" aria-label="${label}" title="${label}"${hidden ? ' hidden' : ''}>${picture}</button>`;
export const ROOM_MARKUP = `<div id="flops-room" lang="ru" data-auto="off">
 <header class="room-header"><a href="/flops" aria-label="На главную">${roomIcon('back')}</a><h1>Домик</h1><a href="/flops/shop" aria-label="Магазин">${roomIcon('shop')}</a></header>
 <nav class="room-choices" aria-label="Комната">${[['peach','Персиковая','stand'],['blue','Голубая','sit'],['sage','Зелёная','sleep']].map(([id,label,pose])=>`<button type="button" data-room="${id}" aria-label="${label}" title="${label}" aria-pressed="${id === 'peach'}"><img class="room-choice-background" src="/assets/clay/room-${id}.webp" alt=""><img class="room-choice-pug" src="/assets/clay/room-pug-${pose}.webp" alt=""></button>`).join('')}</nav>
 <div class="room-stage" aria-label="Комната Флопса">
  <div class="room-scene"></div>
  <div id="room-actor" class="room-actor"><div class="room-outfit-back"></div><button class="kids-mascot" aria-label="Флопс" type="button"><img class="kids-mascot-fallback" src="/assets/clay/room-pug-stand.webp" alt="Флопс"></button><div class="room-outfit"></div><img class="room-face-occlusion" src="/assets/clay/room-pug-stand.webp" alt="" aria-hidden="true"><div class="room-outfit-head"></div></div>
 </div>
 <div class="room-edit" role="toolbar" aria-label="Действия с выбранным предметом" hidden>
  <span class="room-selected-picture"><img id="room-selected-image" alt="" class="room-selected-image"></span><strong id="room-selected" class="room-sr"></strong>
  ${action('room-play','Играть',roomIcon('play'),true)}${action('room-play-extra','Солнышко на турнике',roomIcon('spin'),true)}${action('room-wardrobe-toggle','Закрыть дверцы шкафа',roomIcon('closet'),true)}${action('room-closet-open','Одежда в шкафу',roomIcon('hanger'),true)}${action('room-hang','Повесить в шкаф',roomIcon('hanger'),true)}${action('room-wear','Надеть',roomIcon('wear'),true)}${action('room-hold','Взять скакалку в лапы',posePicture('stand','up'),true)}${action('room-seat','Сесть',posePicture('sit'),true)}${action('room-surface','Поставить на стол или полку',roomIcon('surface'),true)}
  <button type="button" class="room-action" data-corner="left" aria-label="Стол в левый угол" title="Стол в левый угол" hidden>${roomIcon('leftCorner')}</button><button type="button" class="room-action" data-corner="right" aria-label="Стол в правый угол" title="Стол в правый угол" hidden>${roomIcon('rightCorner')}</button>
  ${action('room-smaller','Уменьшить',roomIcon('smaller'))}${action('room-larger','Увеличить',roomIcon('larger'))}${action('room-rotate','Повернуть',roomIcon('rotate'))}${action('room-remove','Убрать в коллекцию',roomIcon('remove'))}
  <div class="room-depth-label" role="group" aria-label="Расстояние">${[[.64,'У стены'],[.78,'Посередине'],[.92,'Ближе']].map(([value,label],i)=>`<button type="button" data-depth="${value}" aria-label="${label}" title="${label}" aria-pressed="false">${depthPicture(i)}</button>`).join('')}</div>
 </div>
 <div class="room-inventory" aria-label="Купленные вещи"></div>
 <p class="room-empty" hidden>В коллекции пока пусто</p>
 <dialog class="room-closet" aria-labelledby="room-closet-title">
  <header class="room-closet-header"><img src="/assets/clay/room-items/yellow_wardrobe.webp" alt=""><h2 id="room-closet-title">Жёлтый шкаф</h2><button type="button" id="room-closet-close" aria-label="Закрыть окно одежды">${roomIcon('close')}</button></header>
  <section class="room-closet-section" id="room-closet-stored"><h3>На вешалках</h3><div class="room-closet-grid" id="room-closet-hanging"></div></section>
  <section class="room-closet-section" id="room-closet-rest"><h3>Одежда Флопса</h3><div class="room-closet-grid" id="room-closet-available"></div></section>
  <p class="room-closet-empty" hidden>Одежду и костюмы можно выбрать в <a href="/flops/shop">магазине</a>.</p>
 </dialog>
 <dialog class="room-surfaces room-closet" aria-labelledby="room-surfaces-title">
  <header class="room-closet-header"><h2 id="room-surfaces-title">Куда поставить?</h2><button type="button" id="room-surfaces-close" aria-label="Закрыть выбор полки">${roomIcon('close')}</button></header>
  <div class="room-closet-grid" id="room-surfaces-grid"></div>
 </dialog>
 <span class="room-sr" aria-live="polite" id="room-status"></span>
</div>`;
