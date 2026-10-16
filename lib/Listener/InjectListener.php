<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar\Listener;

use OCA\ChatBar\Config;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Services\IInitialState;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IUserSession;
use OCP\Util;

/** @template-implements IEventListener<Event> */
class InjectListener implements IEventListener {
	public function __construct(private IUserSession $session, private Config $config, private IInitialState $state) {}
	public function handle(Event $event): void {
		if (!($event instanceof BeforeTemplateRenderedEvent) || !$event->isLoggedIn()) return;
		$user = $this->session->getUser();
		if ($user === null || !$this->config->active($user)) return;
		$this->state->provideInitialState('colors', $this->config->colors($user->getUID()));
		Util::addStyle('chatbar', 'chatbar');
		Util::addTranslations('chatbar');
		Util::addScript('chatbar', 'chatbar');
	}
}
