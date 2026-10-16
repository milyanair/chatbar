<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar\Settings;

use OCA\ChatBar\Config;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IGroupManager;
use OCP\Settings\ISettings;
use OCP\Util;

class Admin implements ISettings {
	public function __construct(private Config $config, private IGroupManager $groups, private IAppManager $apps) {}
	public function getForm(): TemplateResponse {
		Util::addScript('chatbar', 'chatbar-settings');
		$all = array_map(fn ($g) => ['id' => $g->getGID(), 'name' => $g->getDisplayName()], $this->groups->search(''));
		return new TemplateResponse('chatbar', 'admin', ['groups' => $all, 'selected' => $this->config->groups(), 'defaults' => $this->config->defaultColors(), 'talk' => $this->apps->isEnabledForAnyone('spreed')], '');
	}
	public function getSection(): string { return 'chatbar'; }
	public function getPriority(): int { return 10; }
}
