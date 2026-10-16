<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar;

use OCP\App\IAppManager;
use OCP\IConfig;
use OCP\IGroupManager;
use OCP\IUser;

class Config {
	public function __construct(private IConfig $config, private IGroupManager $groups, private IAppManager $apps) {}
	/** @return string[] empty = all users */
	public function groups(): array {
		$v = json_decode($this->config->getAppValue('chatbar', 'groups', '[]'), true);
		return is_array($v) ? array_values(array_filter($v, 'is_string')) : [];
	}
	public function setGroups(array $g): void {
		$g = array_values(array_filter($g, fn ($x) => is_string($x) && $this->groups->groupExists($x)));
		$this->config->setAppValue('chatbar', 'groups', json_encode($g));
	}
	public static function hex(?string $c): string { return is_string($c) && preg_match('/^#[0-9a-fA-F]{6}$/', $c) ? strtolower($c) : ''; }
	/** Admin defaults; '' = theme primary / theme error color. */
	public function defaultColors(): array {
		return ['action' => self::hex($this->config->getAppValue('chatbar', 'default_action', '')), 'notify' => self::hex($this->config->getAppValue('chatbar', 'default_notify', ''))];
	}
	public function setDefaultColors(string $action, string $notify): void {
		$this->config->setAppValue('chatbar', 'default_action', self::hex($action));
		$this->config->setAppValue('chatbar', 'default_notify', self::hex($notify));
	}
	public function userColors(string $uid): array {
		return ['action' => self::hex($this->config->getUserValue($uid, 'chatbar', 'action', '')), 'notify' => self::hex($this->config->getUserValue($uid, 'chatbar', 'notify', ''))];
	}
	public function setUserColors(string $uid, string $action, string $notify): void {
		$this->config->setUserValue($uid, 'chatbar', 'action', self::hex($action));
		$this->config->setUserValue($uid, 'chatbar', 'notify', self::hex($notify));
	}
	/** Effective colors: user, then admin default, then '' (theme). */
	public function colors(string $uid): array {
		$u = $this->userColors($uid); $d = $this->defaultColors();
		return ['action' => $u['action'] ?: $d['action'], 'notify' => $u['notify'] ?: $d['notify'], 'defaults' => $d, 'user' => $u];
	}
	public function hidden(string $uid): bool { return $this->config->getUserValue($uid, 'chatbar', 'hidden', '0') === '1'; }
	public function setHidden(string $uid, bool $h): void { $this->config->setUserValue($uid, 'chatbar', 'hidden', $h ? '1' : '0'); }
	public function allowed(IUser $user): bool {
		$g = $this->groups();
		if ($g === []) return true;
		foreach ($g as $gid) if ($this->groups->isInGroup($user->getUID(), $gid)) return true;
		return false;
	}
	public function talkEnabled(IUser $user): bool { return $this->apps->isEnabledForUser('spreed', $user); }
	public function active(IUser $user): bool { return $this->talkEnabled($user) && $this->allowed($user) && !$this->hidden($user->getUID()); }
}
