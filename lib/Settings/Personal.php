<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar\Settings;

use OCA\ChatBar\Config;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IUserSession;
use OCP\Settings\ISettings;
use OCP\Util;

class Personal implements ISettings {
	public function __construct(private Config $config, private IUserSession $session) {}
	public function getForm(): TemplateResponse {
		Util::addScript('chatbar', 'chatbar-settings');
		$u = $this->session->getUser();
		return new TemplateResponse('chatbar', 'personal', [
			'colors' => $u ? $this->config->colors($u->getUID()) : ['action' => '', 'notify' => '', 'user' => ['action' => '', 'notify' => ''], 'defaults' => ['action' => '', 'notify' => '']],
			'hidden' => $u ? $this->config->hidden($u->getUID()) : false,
			'allowed' => $u ? ($this->config->allowed($u) && $this->config->talkEnabled($u)) : false,
		], '');
	}
	public function getSection(): string { return 'chatbar'; }
	public function getPriority(): int { return 10; }
}
