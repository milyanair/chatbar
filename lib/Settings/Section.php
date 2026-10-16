<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar\Settings;

use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\Settings\IIconSection;

class Section implements IIconSection {
	public function __construct(private IL10N $l, private IURLGenerator $url) {}
	public function getID(): string { return 'chatbar'; }
	public function getName(): string { return $this->l->t('Chat Bar'); }
	public function getPriority(): int { return 80; }
	public function getIcon(): string { return $this->url->imagePath('chatbar', 'app-dark.svg'); }
}
