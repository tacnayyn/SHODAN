const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
//const ms = require("ms");
const { timecode } = require("simple-timecode");

const command = new SlashCommand()
	.setName("seektimecode")
	.setDescription("Seek to a specific time in the current song.")
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("Seek to time you want. Ex 2:32")
			.setRequired(true),
	)
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Lavalink node is not connected"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("There is no music playing."),
				],
				ephemeral: true,
			});
		}
		
		await interaction.deferReply();
		
		const args = interaction.options.getString("time");
		//const time = ms(args);
		const time = timecode.TimeToMilliseconds(args);
		const position = player.position;
		const duration = player.queue.current.duration;
		
		if (time <= duration) {
			player.seek(time);
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(client.config.embedColor)
						.setDescription(
							`⏩ | **${ player.queue.current.title }** has been ${
								time < position? "rewound" : "seeked"
							} to **${ timecode.MillisecondsToTime(time) }**`,
						),
				],
			});
		} else {
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(client.config.embedColor)
						.setDescription(
							`Cannot seek current playing track. Seek duration has exceeded track duration`,
						),
				],
			});
		}
	});

module.exports = command;
