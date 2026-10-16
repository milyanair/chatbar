<?php
/** @var array $_ */
/** @var \OCP\IL10N $l */
?>
<div id="chatbar-admin" class="section">
	<h2><?php p($l->t('Chat Bar')); ?></h2>
	<p class="settings-hint"><?php p($l->t('Leave all groups unchecked to show the Chat Bar to every user who has Talk. Check groups to limit it to their members.')); ?></p>
	<?php foreach ($_['groups'] as $g): ?>
		<p><input type="checkbox" class="checkbox chatbar-group" id="chatbar-g-<?php p(md5($g['id'])); ?>" value="<?php p($g['id']); ?>" <?php if (in_array($g['id'], $_['selected'], true)) print_unescaped('checked'); ?>>
		<label for="chatbar-g-<?php p(md5($g['id'])); ?>"><?php p($g['name']); ?></label></p>
	<?php endforeach; ?>
	<button id="chatbar-save-groups" class="button primary"><?php p($l->t('Save')); ?></button>
	<span id="chatbar-admin-msg" class="msg"></span>
	<h3><?php p($l->t('Default colors')); ?></h3>
	<p class="settings-hint"><?php p($l->t('Defaults for users who have not picked their own colors. Reset to follow the theme.')); ?></p>
	<div class="chatbar-colors" data-scope="admin" data-default-action="" data-default-notify="">
		<p><input type="color" id="chatbar-color-action" value="<?php p($_['defaults']['action']); ?>" data-set="<?php p($_['defaults']['action'] ? '1' : ''); ?>">
		<label for="chatbar-color-action"><?php p($l->t('Action')); ?></label></p>
		<p><input type="color" id="chatbar-color-notify" value="<?php p($_['defaults']['notify']); ?>" data-set="<?php p($_['defaults']['notify'] ? '1' : ''); ?>">
		<label for="chatbar-color-notify"><?php p($l->t('Notify')); ?></label></p>
		<button type="button" class="button" id="chatbar-color-reset"><?php p($l->t('Reset to default')); ?></button>
		<span id="chatbar-color-msg" class="msg"></span>
	</div>
</div>
