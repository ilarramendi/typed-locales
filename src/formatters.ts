export default {
	lowercase: (value: string) => value.toLowerCase(),
	uppercase: (value: string) => value.toUpperCase(),
	capitalize: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
	void: () => '',
	weekday: (value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'long' }),
	number: (value: string) => value.toLocaleString(),
}