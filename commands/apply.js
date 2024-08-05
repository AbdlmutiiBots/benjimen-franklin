const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { handleTZ } = require("../functions/timezone.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply to be a freelancer')
        .addStringOption(option => 
            option.setName('portfolio')
                .setDescription('Your portfolio link')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('timezone')
                .setDescription('Your timezone')
                .setRequired(true)),
    async execute(interaction, db, bot) {
        const portfolio = interaction.options.getString('portfolio');
        const timezone = interaction.options.getString('timezone');
        const role = interaction.member.roles.highest.id;
        const timenow = handleTZ(timezone);

        if (timenow === "Invalid") {
            return interaction.reply("Incorrect timezone format. Please check it from <https://time.is/> and enter your city.");
        }

        const pendingEmbed = new MessageEmbed()
            .setTitle(interaction.user.tag)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(portfolio)
            .setColor("#880c24")
            .addFields(
                { name: "Service", value: `<@&${role}>` },
                { name: "Timezone", value: `${timezone} (${timenow})` }
            );

        const pendingButtons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("yep")
                    .setLabel("Accept")
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setCustomId("nah")
                    .setLabel("Ignore")
                    .setStyle("DANGER"),
            );

        await bot.channels.cache.get(process.env.PENDING_CHANNEL_ID).send({ 
            embeds: [pendingEmbed], 
            components: [pendingButtons], 
            content: `${interaction.user.id}`
        });

        db.set("waitlist_" + interaction.user.id, { portfolio, role, timezone, reviews: [] });

        await interaction.reply("Setting you up! Please know that your service is based on your highest role.");
        setTimeout(() => interaction.deleteReply(), 5000);
        await interaction.user.send("**✅ You have applied successfully. You're on a waitlist until admins approve you.**");
    }
};
