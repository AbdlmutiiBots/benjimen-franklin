const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { handleTZ } = require("../functions/timezone.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View a freelancer\'s profile')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to view the profile of')
                .setRequired(true)),
    async execute(interaction, db, bot) {
        const u = interaction.options.getUser('user');

        if (!db.get(u.id)) {
            return interaction.reply("User is still on waitlist");
        }

        const o = db.get(u.id);
        const timenow = handleTZ(o.timezone);

        const mbed = new MessageEmbed()
            .setTitle(u.tag)
            .setThumbnail(u.displayAvatarURL({ dynamic: true }))
            .setDescription(o.portfolio)
            .setColor("#880c24")
            .addFields(
                { name: "Service", value: `<@&${o.role}>` },
                { name: "Timezone", value: `${o.timezone} (${timenow}) ` }
            );

        const order = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("rvs_" + u.id)
                    .setLabel("Reviews")
                    .setStyle("SECONDARY")
            );

        await interaction.reply({ embeds: [mbed], components: [order] });
    }
};
