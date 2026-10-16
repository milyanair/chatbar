const fs = require('fs'); const { page } = require('./frame')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const mock = (open, colors) => `<link rel="stylesheet" href="chatbar.css"><script>
localStorage.clear();localStorage.setItem('chatbar:demo:open','${open}');
const now=Math.floor(Date.now()/1000);
const M=(id,who,name,ago,text)=>({id,actorType:'users',actorId:who,actorDisplayName:name,timestamp:now-ago,message:text,systemMessage:'',messageParameters:{}});
const lm=M(9,'alex','Alex Rivera',60,'Deck is updated. Can you review the launch slides before 3 pm?');
const rooms=[{token:'a1',type:1,displayName:'Alex Rivera',unreadMessages:3,lastActivity:now,lastMessage:lm},{token:'b2',type:2,displayName:'Product team',unreadMessages:1,lastActivity:now-900},{token:'c3',type:2,displayName:'Support',unreadMessages:0,lastActivity:now-4000}];
const msgs=[lm,M(8,'alex','Alex Rivera',120,'I moved the pricing table to slide 4.'),M(7,'demo','Demo User',400,'Sounds good, sending notes shortly'),M(6,'alex','Alex Rivera',700,'Morning! Launch prep sync at 2?'),M(5,'demo','Demo User',760,'Yes, see you there')];
window.fetch=(u)=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({ocs:{data:u.includes('/room')?rooms:msgs}})});
</script>${colors ? `<input type=hidden id="initial-state-chatbar-colors" value="${Buffer.from(JSON.stringify(colors)).toString('base64')}">` : ''}`
const settings = `<div style="position:fixed;top:50px;left:250px;right:0;bottom:0;background:var(--color-main-background);padding:26px 40px;box-sizing:border-box;font-size:15px">
<div id="chatbar-personal" class="section"><h2>Chat Bar</h2>
<p><input type="checkbox" id="chatbar-hidden"> <label for="chatbar-hidden">Hide the Chat Bar for my account</label></p><span id="chatbar-personal-msg" class="msg"></span>
<h3>Colors</h3><p style="color:#6b6b6b">Leave a color on its default to follow the theme.</p>
<div class="chatbar-colors" data-scope="personal" data-default-action="" data-default-notify="">
<p><input type="color" id="chatbar-color-action" value="#16a085" data-set="1" style="width:44px;height:30px;vertical-align:middle;margin-right:8px"><label for="chatbar-color-action">Action</label> <span style="color:#6b6b6b">Header gradient and buttons</span></p>
<p><input type="color" id="chatbar-color-notify" value="#db3939" data-set="1" style="width:44px;height:30px;vertical-align:middle;margin-right:8px"><label for="chatbar-color-notify">Notify</label> <span style="color:#6b6b6b">Unread badge (white text)</span></p>
<button type="button" class="button" id="chatbar-color-reset" style="padding:8px 14px;border-radius:18px;border:1px solid #ccc;background:#fff">Reset to default</button></div></div></div>
<script>window.OC={generateUrl:p=>p,requestToken:'x',getCurrentUser:()=>({uid:'demo'})};window.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({action:'#16a085',notify:'#db3939'})})</script><script src="chatbar-settings.js"></script>`
const shots = [
  ['1-collapsed', { head: mock(false), body: '<script src="chatbar.js"></script>', caption: 'Talk, on every page', sub: 'Unread count and the latest message, without leaving your work' }],
  ['2-expanded', { head: mock(true), body: '<script src="chatbar.js"></script>', caption: 'Read and reply in place', sub: 'Expand for the last messages and a quick reply field' }],
  ['3-colors', { head: mock(true, { action: '#16a085', notify: '#db3939' }), body: '<script src="chatbar.js"></script>', caption: 'Your colors', sub: 'Personal Action and Notify colors, or follow the theme' }],
  ['4-dark', { dark: true, head: mock(true), body: '<script src="chatbar.js"></script>', caption: 'Light and dark mode', sub: 'Follows your Nextcloud theme automatically' }],
  ['5-settings', { app: '', nav: ['Personal info', 'Security', 'Notifications', '*Chat Bar', 'Post It'], head: '<link rel="stylesheet" href="chatbar.css">', body: settings, caption: 'Simple settings', sub: 'Users can hide it; admins choose groups and defaults' }],
]
;(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', e => console.log('ERR', e.message))
  const out = require('path').join(__dirname, '../../screenshots/'); fs.mkdirSync(out, { recursive: true })
  for (const [name, o] of shots) {
    fs.writeFileSync(require('path').join(__dirname, 'cb.html'), page(o))
    await p.goto('file://' + require('path').join(__dirname, 'cb.html')); await p.waitForTimeout(900)
    await p.screenshot({ path: out + name + '.png' }); console.log('saved', name)
  }
  await b.close()
})()
