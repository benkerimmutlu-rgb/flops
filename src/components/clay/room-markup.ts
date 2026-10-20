import { roomIcon, posePicture, depthPicture } from './room-icons.js';

const action = (id: string, label: string, picture: string, hidden = false) => `<button type="button" id="${id}" class="room-action" aria-label="${label}" title="${label}"${hidden ? ' hidden' : ''}>${picture}</button>`;
export const ROOM_MARKUP = `<div id="flops-room" lang="ru" data-auto="off">
 <header class="room-header"><a href="/" aria-label="На главную">${roomIcon('back')}</a><h1>Домик</h1><a href="/shop" aria-label="Магазин">${roomIcon('shop')}</a></header>
 <nav class="room-choices" aria-label="Комната">${[['peach','Персиковая','stand'],['blue','Голубая','sit'],['sage','Зелёная','sleep']].map(([id,label,pose])=>`<button type="button" data-room="${id}" aria-label="${label}" title="${label}" aria-pressed="${id === 'peach'}"><img class="room-choice-background" src="/assets/clay/room-${id}.webp" alt=""><img class="room-choice-pug" src="/assets/clay/room-pug-${pose}.webp" alt=""></button>`).join('')}</nav>
 <div class="room-stage" aria-label="Комната Флопса">
  <div class="room-scene"></div>
  <div id="room-actor" class="room-actor"><div class="room-outfit-back"></div><button class="kids-mascot" aria-label="Флопс" type="button"><img class="kids-mascot-fallback" src="/assets/clay/room-pug-stand.webp" alt="Флопс"></button><div class="room-outfit"></div><img class="room-face-occlusion" src="/assets/clay/room-pug-stand.webp" alt="" aria-hidden="true"><div class="room-outfit-head"></div></div>
 </div>
 <div class="room-edit" role="toolbar" aria-label="Действия с выбранным предметом" hidden>
  <img id="room-selected-image" alt="" class="room-selected-image"><strong id="room-selected" class="room-sr"></strong>
  <div class="room-depth-label" role="group" aria-label="Расстояние">${[[.64,'У стены'],[.78,'Посередине'],[.92,'Ближе']].map(([value,label],i)=>`<button type="button" data-depth="${value}" aria-label="${label}" title="${label}" aria-pressed="false">${depthPicture(i)}</button>`).join('')}</div>
  ${action('room-smaller','Уменьшить',roomIcon('smaller'))}${action('room-larger','Увеличить',roomIcon('larger'))}${action('room-rotate','Повернуть',roomIcon('rotate'))}
  ${action('room-wear','Надеть',posePicture('stand','down'),true)}${action('room-seat','Сесть',posePicture('sit'),true)}${action('room-surface','На стол',roomIcon('surface'),true)}${action('room-remove','Убрать в коллекцию',roomIcon('remove'))}
 </div>
 <div class="room-inventory" aria-label="Купленные вещи"></div>
 <p class="room-empty" hidden>В коллекции пока пусто</p>
 <span class="room-sr" aria-live="polite" id="room-status"></span>
</div>`;
