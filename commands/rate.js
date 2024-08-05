const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription('Rate a freelancer')
        .addUserOption(option => 
            option.setName('freelancer')
                .setDescription('The freelancer to rate')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('rating')
                .setDescription('The rating (1-5)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('comment')
                .setDescription('A comment for the rating')
                .setRequired(true)),
    async execute(interaction, db, bot) {
        const freelancer = interaction.options.getUser('freelancer');
        const rating = interaction.options.getInteger('rating');
        const comment = interaction.options.getString('comment');

        if (rating < 1 || rating > 5) {
            return interaction.reply("Please provide a valid rating between 1 and 5.");
        }

        if (!db.get(freelancer.id)) {
            return interaction.reply("This user isn't a freelancer yet.");
        }

        const fl = db.get(freelancer.id);
        fl.reviews.push({
            stars: rating,
            comment: comment,
            user: { username: interaction.user.tag, avatarURL: interaction.user.displayAvatarURL() }
        });

        await db.set(freelancer.id, fl);
        await interaction.reply(`Thank you, your rating has been added to ${freelancer.tag}'s profile`);
        db.set(interaction.user.id + "_rated", true);

        setTimeout(() => {
            db.delete(interaction.user.id + "_rated");
        }, 1800000);
    }
};

