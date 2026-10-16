<?php
declare(strict_types=1);
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\ChatBar\Controller;

use OCA\ChatBar\Config;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

class SettingsController extends Controller {
	public function __construct(IRequest $request, private Config $config, private IUserSession $session) {
		parent::__construct('chatbar', $request);
	}
	/** Admin only (default). */
	public function setGroups(array $groups = []): JSONResponse {
		$this->config->setGroups($groups);
		return new JSONResponse(['groups' => $this->config->groups()]);
	}
	/** Admin only (default). */
	public function setDefaultColors(string $action = '', string $notify = ''): JSONResponse {
		$this->config->setDefaultColors($action, $notify);
		return new JSONResponse($this->config->defaultColors());
	}
	#[NoAdminRequired]
	public function setColors(string $action = '', string $notify = ''): JSONResponse {
		$u = $this->session->getUser();
		if ($u === null) return new JSONResponse([], 401);
		$this->config->setUserColors($u->getUID(), $action, $notify);
		return new JSONResponse($this->config->colors($u->getUID()));
	}
	#[NoAdminRequired]
	public function setHidden(bool $hidden = false): JSONResponse {
		$u = $this->session->getUser();
		if ($u === null) return new JSONResponse([], 401);
		$this->config->setHidden($u->getUID(), $hidden);
		return new JSONResponse(['hidden' => $hidden]);
	}
}
