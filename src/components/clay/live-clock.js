export const LIVE_CLOCKS = {
    live_clock_blue: {x:300,y:210,r:100,ticks:true,color:'#233c58'},
    live_clock_green: {digital:true},
    cuckoo_clock: {x:314,y:279,r:64,ticks:false,color:'#6d4329'},
};
export function localClockTime(date = new Date()) {
    const hours=date.getHours(),minutes=date.getMinutes(),seconds=date.getSeconds();
    return {hour:(hours%12)*30+minutes*.5+seconds/120,minute:minutes*6+seconds*.1,second:seconds*6,
        text:String(hours).padStart(2,'0')+':'+String(minutes).padStart(2,'0')};
}
export function liveClockMarkup(id) {
    const face=LIVE_CLOCKS[id];if(!face)return '';
    let content='';
    if(face.digital)content='<text data-clock-digits x="300" y="291" text-anchor="middle" dominant-baseline="middle" fill="#2b4539" font-family="monospace" font-size="100" font-weight="700" letter-spacing="-5">--:--</text>';
    else {
        const {x,y,r,color}=face;
        if(face.ticks)for(let n=0;n<12;n++)content+=`<circle cx="${x+Math.sin(n*Math.PI/6)*r}" cy="${y-Math.cos(n*Math.PI/6)*r}" r="${n%3?3:5}" fill="${color}"/>`;
        for(const [hand,length,width,paint] of [['hour',r*.55,8,color],['minute',r*.83,6,color],['second',r*.88,2.5,'#c56a46']])
            content+=`<g data-clock-hand="${hand}"><path d="M${x} ${y+8}V${y-length}" stroke="${paint}" stroke-width="${width}" stroke-linecap="round"/></g>`;
        content+=`<circle cx="${x}" cy="${y}" r="6" fill="${color}"/><circle cx="${x-1}" cy="${y-1}" r="2" fill="#fff2c4"/>`;
    }
    return `<svg class="live-clock-face" data-live-clock="${id}" viewBox="0 0 640 640" role="img" aria-label="Текущее время">${content}</svg>`;
}
// Read the device clock on every tick instead of accumulating elapsed seconds.
// Returning from sleep, timezone changes and manual clock corrections are picked up automatically.
export function createLiveClockController(root, now = () => new Date()) {
    function update() {
        const time=localClockTime(now());
        for(const node of root.querySelectorAll('[data-live-clock]')){
            const face=LIVE_CLOCKS[node.dataset.liveClock];if(!face)continue;
            node.setAttribute('aria-label','Текущее время '+time.text);
            const digits=node.querySelector('[data-clock-digits]');if(digits)digits.textContent=time.text;
            for(const hand of node.querySelectorAll('[data-clock-hand]'))hand.setAttribute('transform',`rotate(${time[hand.dataset.clockHand]} ${face.x} ${face.y})`);
        }
    }
    update();const timer=setInterval(update,1000);
    const visible=()=>{if(!document.hidden)update();};
    document.addEventListener('visibilitychange',visible);window.addEventListener('focus',update);
    return {update,destroy(){clearInterval(timer);document.removeEventListener('visibilitychange',visible);window.removeEventListener('focus',update);}};
}
