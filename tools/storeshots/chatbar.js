/* SPDX-License-Identifier: AGPL-3.0-or-later
 * Chat Bar: a floating Nextcloud Talk bar. Uses the Talk OCS API with the user's session. */
(function () {
	'use strict'
	if (window.__chatbar) return
	window.__chatbar = true
	if (window.top !== window.self) return
	if (/\/apps\/spreed(\/|$)|\/call\//.test(location.pathname)) return
	var OCg = window.OC || {}
	var uid = (document.head && document.head.getAttribute('data-user')) || (OCg.getCurrentUser && OCg.getCurrentUser().uid)
	if (!uid) return
	var t = function (s, v) { return window.t ? window.t('chatbar', s, v) : s.replace(/\{(\w+)\}/g, function (a, k) { return v && v[k] != null ? v[k] : a }) }
	var n = function (s, p, c, v) { return window.n ? window.n('chatbar', s, p, c, v) : (c === 1 ? s : p).replace('%n', c) }
	function ocs(path) {
		if (OCg.linkToOCS) return OCg.linkToOCS('apps/spreed/api/' + path.split('/')[0], 2) + path.split('/').slice(1).join('/')
		return (OCg.webroot || '') + '/ocs/v2.php/apps/spreed/api/' + path
	}
	function url(p) { return OCg.generateUrl ? OCg.generateUrl(p) : (OCg.webroot || '') + '/index.php' + p }
	function rtoken() { return OCg.requestToken || (document.head && document.head.getAttribute('data-requesttoken')) || '' }
	function api(method, u, body) {
		var o = { method: method, credentials: 'same-origin', headers: { 'OCS-APIRequest': 'true', 'Accept': 'application/json', 'requesttoken': rtoken() } }
		if (body) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body) }
		return fetch(u + (u.indexOf('?') < 0 ? '?' : '&') + 'format=json', o).then(function (r) {
			if (r.status === 304) return null
			if (r.status === 404) { var e = new Error('notalk'); e.notalk = true; throw e }
			if (!r.ok) throw new Error('HTTP ' + r.status)
			return r.json().then(function (j) { return j.ocs ? j.ocs.data : j })
		})
	}
	var KEY = 'chatbar:' + uid + ':'
	;['pos', 'room', 'open'].forEach(function (k) { // migrate from the earlier "floatchat" prototype
		try { var o = localStorage.getItem('floatchat:' + uid + ':' + k); if (o != null && localStorage.getItem(KEY + k) == null) localStorage.setItem(KEY + k, o) } catch (e) {}
	})
	function get(k, d) { try { var v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }
	function set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)) } catch (e) {} }
	function el(tag, c, txt) { var e = document.createElement(tag); if (c) e.className = c; if (txt != null) e.textContent = txt; return e }

	var bar = el('div'); bar.id = 'chatbar'; bar.setAttribute('role', 'complementary'); bar.setAttribute('aria-label', t('Chat Bar'))
	var head = el('div', 'cb-head'); head.title = t('Drag to move')
	var badge = el('span', 'cb-badge cb-zero', '0')
	head.append(el('span', 'cb-grip', '\u22EE\u22EE'), el('span', 'cb-title', t('Talk')), badge)
	var row = el('div', 'cb-row')
	var sel = el('select'); sel.setAttribute('aria-label', t('Conversation'))
	var tog = el('button', 'cb-btn cb-tog', '\u25B4'); tog.type = 'button'
	var open = el('button', 'cb-btn', '\u2197'); open.type = 'button'; open.title = t('Open in Talk'); open.setAttribute('aria-label', open.title)
	row.append(sel, tog, open)
	var log = el('div', 'cb-log')
	var prev = el('div', 'cb-prev'); var pvH = el('div', 'cb-pvh'); var pvN = el('b'); var pvT = el('span', 'cb-t')
	pvH.append(pvN, pvT); var pvX = el('div', 'cb-pvx', t('No messages yet')); prev.append(pvH, pvX)
	var form = el('form'); var inp = el('input', 'cb-in'); inp.type = 'text'; inp.placeholder = t('Message …'); inp.maxLength = 32000
	inp.setAttribute('aria-label', t('Message'))
	var send = el('button', 'primary cb-send', t('Send')); send.type = 'submit'
	form.append(inp, send)
	bar.append(head, row, log, prev, form)

	function initialColors() {
		try {
			if (window.OCP && OCP.InitialState && OCP.InitialState.loadState) return OCP.InitialState.loadState('chatbar', 'colors', {})
			var e = document.getElementById('initial-state-chatbar-colors'); return e ? JSON.parse(atob(e.value)) : {}
		} catch (e) { return {} }
	}
	function applyColors(c) {
		c = c || {}
		;[['action', '--cb-action'], ['notify', '--cb-notify']].forEach(function (p) {
			if (/^#[0-9a-f]{6}$/i.test(c[p[0]] || '')) bar.style.setProperty(p[1], c[p[0]]); else bar.style.removeProperty(p[1])
		})
		if (c.action) bar.style.setProperty('--cb-action-text', '#fff'); else bar.style.removeProperty('--cb-action-text')
	}
	applyColors(initialColors())
	window.ChatBar = { applyColors: applyColors }
	window.addEventListener('storage', function (e) { if (e.key === 'chatbar:' + uid + ':colors' && e.newValue) { try { applyColors(JSON.parse(e.newValue)) } catch (x) {} } })
	var rooms = [], cur = get('room', null), expanded = !!get('open', false), lastUnread = null, seen = {}, timer = null, busy = false

	function clampTo(x, y) {
		var w = bar.offsetWidth || 340, h = bar.offsetHeight || 120
		x = Math.min(Math.max(0, x), window.innerWidth - w); y = Math.min(Math.max(0, y), window.innerHeight - h)
		bar.style.left = x + 'px'; bar.style.top = y + 'px'; bar.style.right = 'auto'; bar.style.bottom = 'auto'
	}
	function place() { var p = get('pos', null); if (p) clampTo(p.x, p.y) }
	head.addEventListener('pointerdown', function (e) {
		if (e.button !== 0) return
		var r = bar.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top
		head.setPointerCapture(e.pointerId)
		function mv(ev) { clampTo(ev.clientX - dx, ev.clientY - dy) }
		function up() { head.removeEventListener('pointermove', mv); head.removeEventListener('pointerup', up); var b = bar.getBoundingClientRect(); set('pos', { x: b.left, y: b.top }) }
		head.addEventListener('pointermove', mv); head.addEventListener('pointerup', up)
	})
	window.addEventListener('resize', place)

	function setExpanded(v) {
		expanded = v; set('open', v); bar.classList.toggle('cb-open', v)
		tog.textContent = v ? '\u25BE' : '\u25B4'
		tog.title = v ? t('Collapse') : t('Show recent messages'); tog.setAttribute('aria-label', tog.title); tog.setAttribute('aria-expanded', String(v))
		place(); if (v) loadChat(true); schedule()
	}
	tog.onclick = function () { setExpanded(!expanded) }
	prev.onclick = function () { setExpanded(true) }
	open.onclick = function () { location.href = cur ? url('/call/' + encodeURIComponent(cur)) : url('/apps/spreed/') }
	sel.onchange = function () { cur = sel.value; set('room', cur); preview(); log.textContent = ''; if (expanded) loadChat(true) }

	function textOf(m) {
		var p = (m && m.messageParameters) || {}
		return ((m && m.message) || '').replace(/\{([a-z0-9-]+)\}/gi, function (a, k) { return p[k] && p[k].name ? (p[k].type === 'user' ? '@' : '') + p[k].name : a })
	}
	function rel(ts) {
		var s = Math.max(0, Date.now() / 1000 - ts)
		if (s < 60) return t('just now')
		if (s < 3600) return n('{m} min ago', '{m} min ago', Math.floor(s / 60), { m: Math.floor(s / 60) }).replace('{m}', Math.floor(s / 60))
		if (s < 86400) return n('{h} h ago', '{h} h ago', Math.floor(s / 3600), { h: Math.floor(s / 3600) }).replace('{h}', Math.floor(s / 3600))
		if (s < 604800) return n('{d} d ago', '{d} d ago', Math.floor(s / 86400), { d: Math.floor(s / 86400) }).replace('{d}', Math.floor(s / 86400))
		return new Date(ts * 1000).toLocaleDateString()
	}
	function clock(ts) { return new Date(ts * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
	function preview() {
		var r = rooms.filter(function (x) { return x.token === cur })[0], m = r && r.lastMessage
		if (!m || !m.id) { pvN.textContent = ''; pvT.textContent = ''; pvX.textContent = t('No messages yet'); prev.title = ''; return }
		pvN.textContent = m.actorDisplayName || m.actorId || t('Guest'); pvT.textContent = rel(m.timestamp)
		pvX.textContent = textOf(m); prev.title = pvX.textContent
	}
	function render(msgs) {
		log.textContent = ''
		msgs = (msgs || []).filter(function (m) { return m.systemMessage === '' && m.messageType !== 'command' }).slice(-10)
		if (!msgs.length) { log.append(el('div', 'cb-empty', t('No messages yet'))); return }
		msgs.forEach(function (m) {
			var r = el('div', 'cb-m' + (m.actorType === 'users' && m.actorId === uid ? ' cb-me' : ''))
			var h = el('div'); h.append(el('b', '', m.actorDisplayName || m.actorId || t('Guest')), el('span', 'cb-t', clock(m.timestamp)))
			r.append(h, el('div', 'cb-x', textOf(m))); log.append(r)
		})
		log.scrollTop = log.scrollHeight
	}
	function loadChat(markRead) {
		if (!cur) return Promise.resolve()
		return api('GET', ocs('v1/chat/' + encodeURIComponent(cur)) + '?lookIntoFuture=0&limit=20&setReadMarker=' + (markRead ? 1 : 0))
			.then(function (d) { render((d || []).slice().reverse()); if (markRead) return refreshRooms() })
			.catch(function () {})
	}
	function alertNew(r) {
		bar.classList.remove('cb-flash'); void bar.offsetWidth; bar.classList.add('cb-flash')
		if (!('Notification' in window) || Notification.permission !== 'granted' || (!document.hidden && expanded)) return
		var lm = r.lastMessage || {}, id = r.token + ':' + (lm.id || '')
		if (seen[id]) return
		seen[id] = 1
		try {
			var nt = new Notification(t('{name} · Talk', { name: lm.actorDisplayName || r.displayName }), { body: textOf(lm).slice(0, 200), tag: 'chatbar-' + r.token })
			nt.onclick = function () { window.focus(); cur = r.token; set('room', cur); sel.value = cur; setExpanded(true); nt.close() }
		} catch (e) {}
	}
	function refreshRooms() {
		return api('GET', ocs('v4/room') + '?noStatusUpdate=1').then(function (d) {
			rooms = (d || []).slice().sort(function (a, b) { return (b.lastActivity || 0) - (a.lastActivity || 0) })
			if (!cur || !rooms.some(function (r) { return r.token === cur })) { cur = rooms.length ? rooms[0].token : null; set('room', cur) }
			sel.textContent = ''
			var total = 0
			rooms.forEach(function (r) {
				var o = el('option', '', (r.unreadMessages ? '(' + r.unreadMessages + ') ' : '') + r.displayName); o.value = r.token; sel.append(o)
				total += r.unreadMessages || 0
			})
			if (cur) sel.value = cur
			preview()
			badge.textContent = total > 99 ? '99+' : String(total); badge.classList.toggle('cb-zero', !total)
			badge.title = n('%n unread message', '%n unread messages', total)
			if (lastUnread !== null && total > lastUnread) { var hit = rooms.filter(function (r) { return r.unreadMessages > 0 })[0]; if (hit) alertNew(hit) }
			lastUnread = total
		}).catch(function (e) { if (e && e.notalk) { bar.remove(); clearTimeout(timer); timer = -1 } })
	}
	function tick() {
		if (timer === -1) return
		if (document.hidden || busy) return schedule()
		busy = true
		refreshRooms().then(function () { return expanded ? loadChat(true) : null }).then(function () { busy = false; schedule() }, function () { busy = false; schedule() })
	}
	function schedule() { if (timer === -1) return; clearTimeout(timer); timer = setTimeout(tick, expanded ? 15000 : 45000) }
	document.addEventListener('visibilitychange', function () { if (!document.hidden && timer !== -1) { clearTimeout(timer); tick() } })

	form.onsubmit = function (e) {
		e.preventDefault()
		var msg = inp.value.trim(); if (!msg || !cur) return
		send.disabled = true
		api('POST', ocs('v1/chat/' + encodeURIComponent(cur)), { message: msg })
			.then(function () { inp.value = ''; inp.placeholder = t('Message …'); if (!expanded) setExpanded(true); else loadChat(true) })
			.catch(function () { inp.placeholder = t('Could not send the message') })
			.then(function () { send.disabled = false; inp.focus() })
	}
	inp.addEventListener('focus', function () { if ('Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission() } catch (e) {} } })

	function start() {
		document.body.append(bar)
		setExpanded(expanded)
		refreshRooms().then(function () { if (expanded) loadChat(true); schedule() })
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start()
})()
