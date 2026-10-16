/* SPDX-License-Identifier: AGPL-3.0-or-later */
(function () {
	'use strict'
	var t = function (s) { return (window.t ? window.t('chatbar', s) : s) }
	function post(path, body) {
		return fetch(OC.generateUrl(path), {
			method: 'POST', credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'requesttoken': OC.requestToken },
			body: JSON.stringify(body),
		}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json() })
	}
	function msg(id, ok) { var m = document.getElementById(id); if (m) { m.textContent = ok ? t('Saved') : t('Could not save'); m.className = 'msg ' + (ok ? 'success' : 'error') } }
	function toHex(c) {
		c = (c || '').trim()
		if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase()
		if (/^#[0-9a-f]{3}$/i.test(c)) return ('#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]).toLowerCase()
		var m = c.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/)
		return m ? '#' + [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2) }).join('') : ''
	}
	function themeVar(v, fb) { return toHex(getComputedStyle(document.body).getPropertyValue(v)) || fb }
	function initColors() {
		var box = document.querySelector('.chatbar-colors'); if (!box) return
		var admin = box.getAttribute('data-scope') === 'admin'
		var a = document.getElementById('chatbar-color-action'), n = document.getElementById('chatbar-color-notify'), reset = document.getElementById('chatbar-color-reset')
		var def = {
			action: box.getAttribute('data-default-action') || themeVar('--color-primary-element', '#0082c9'),
			notify: box.getAttribute('data-default-notify') || '#db3939',
		}
		;[[a, 'action'], [n, 'notify']].forEach(function (p) { if (!p[0].getAttribute('data-set')) p[0].value = def[p[1]] })
		function current() { return { action: a.getAttribute('data-set') ? a.value : '', notify: n.getAttribute('data-set') ? n.value : '' } }
		function save() {
			var c = current()
			post(admin ? '/apps/chatbar/admin/colors' : '/apps/chatbar/personal/colors', c).then(function (r) {
				msg('chatbar-color-msg', true)
				if (!admin) {
					var eff = { action: r.action || '', notify: r.notify || '' }
					if (window.ChatBar) window.ChatBar.applyColors(eff)
					try { localStorage.setItem('chatbar:' + OC.getCurrentUser().uid + ':colors', JSON.stringify(eff)) } catch (e) {}
				}
			}, function () { msg('chatbar-color-msg', false) })
		}
		;[a, n].forEach(function (i) {
			i.addEventListener('input', function () {
				i.setAttribute('data-set', '1')
				if (!admin && window.ChatBar) window.ChatBar.applyColors(current())
			})
			i.addEventListener('change', save)
		})
		reset.addEventListener('click', function () {
			a.setAttribute('data-set', ''); n.setAttribute('data-set', '')
			a.value = def.action; n.value = def.notify
			save()
		})
	}
	function init() {
		var b = document.getElementById('chatbar-save-groups')
		if (b) b.addEventListener('click', function () {
			var g = Array.prototype.map.call(document.querySelectorAll('.chatbar-group:checked'), function (c) { return c.value })
			post('/apps/chatbar/admin/groups', { groups: g }).then(function () { msg('chatbar-admin-msg', true) }, function () { msg('chatbar-admin-msg', false) })
		})
		var h = document.getElementById('chatbar-hidden')
		if (h) h.addEventListener('change', function () {
			post('/apps/chatbar/personal/hidden', { hidden: h.checked }).then(function () { msg('chatbar-personal-msg', true) }, function () { msg('chatbar-personal-msg', false) })
		})
		initColors()
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init()
})()
