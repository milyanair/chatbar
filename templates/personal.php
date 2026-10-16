<?php
/** @var array $_ */
/** @var \OCP\IL10N $l */
?>
<div id="chatbar-personal" class="section">
	<h2><?php p($l->t('Chat Bar')); ?></h2>
	<?php if (!$_['allowed']): ?>
		<p class="settings-hint"><?php p($l->t('The Chat Bar is not available for your account (Talk is not enabled or your administrator limited it to other groups).')); ?></p>
	<?php else: ?>
		<p><input type="checkbox" class="checkbox" id="chatbar-hidden" <?php if ($_['hidden']) print_unescaped('checked'); ?>>
		<label for="chatbar-hidden"><?php p($l->t('Hide the Chat Bar for my account')); ?></label></p>
		<span id="chatbar-personal-msg" class="msg"></span>
		<h3><?php p($l->t('Colors')); ?></h3>
		<p class="settings-hint"><?php p($l->t('Leave a color on its default to follow the theme.')); ?></p>
		<div class="chatbar-colors" data-scope="personal" data-default-action="<?php p($_['colors']['defaults']['action']); ?>" data-default-notify="<?php p($_['colors']['defaults']['notify']); ?>">
			<p><input type="color" id="chatbar-color-action" value="<?php p($_['colors']['user']['action']); ?>" data-set="<?php p($_['colors']['user']['action'] ? '1' : ''); ?>">
			<label for="chatbar-color-action"><?php p($l->t('Action')); ?></label> <span class="settings-hint"><?php p($l->t('Header gradient and buttons')); ?></span></p>
			<p><input type="color" id="chatbar-color-notify" value="<?php p($_['colors']['user']['notify']); ?>" data-set="<?php p($_['colors']['user']['notify'] ? '1' : ''); ?>">
			<label for="chatbar-color-notify"><?php p($l->t('Notify')); ?></label> <span class="settings-hint"><?php p($l->t('Unread badge (white text)')); ?></span></p>
			<button type="button" class="button" id="chatbar-color-reset"><?php p($l->t('Reset to default')); ?></button>
			<span id="chatbar-color-msg" class="msg"></span>
		</div>
	<?php endif; ?>
</div>
