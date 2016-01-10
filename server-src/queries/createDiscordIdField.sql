INSERT IGNORE INTO xf_user_field (
    field_id,
    display_group,
    display_order,
    field_type,
    field_choices,
    match_type,
    user_editable,
    viewable_profile,
    viewable_message,
    moderator_editable
) VALUES (
    'discordid',
    'personal',
    1,
    'textbox',
    '',
    'none',
    'yes',
    0,
    0,
    0
)