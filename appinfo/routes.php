<?php
declare(strict_types=1);
return [
	'routes' => [
		['name' => 'settings#setGroups', 'url' => '/admin/groups', 'verb' => 'POST'],
		['name' => 'settings#setColors', 'url' => '/personal/colors', 'verb' => 'POST'],
		['name' => 'settings#setDefaultColors', 'url' => '/admin/colors', 'verb' => 'POST'],
		['name' => 'settings#setHidden', 'url' => '/personal/hidden', 'verb' => 'POST'],
	],
];
