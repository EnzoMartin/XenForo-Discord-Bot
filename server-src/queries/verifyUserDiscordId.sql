SELECT xf_user.email, xf_user_field_value.field_value
FROM xf_user
    LEFT JOIN xf_user_field_value ON xf_user_field_value.user_id = xf_user.user_id
WHERE xf_user.email = ?
    AND xf_user_field_value.field_id = 'discordid'
    AND xf_user_field_value.field_value = ?
LIMIT 1;