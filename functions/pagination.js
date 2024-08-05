const Discord = require('discord.js');

function generateEmbeds(reviews, url) {
  const embeds = [];
  for (let i = 0; i < reviews.length; i++) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${reviews[i].user.username}`, reviews[i].user.avatarURL)
      .setDescription("*" + reviews[i].comment + "*")
      .setThumbnail(url)
      .addField('Stars', "⭐".repeat(reviews[i].stars) + `(${reviews[i].stars})`, true)
      .setColor("#880c24")
      .setFooter(`Rating ${i + 1} of ${reviews.length}`);
    embeds.push(embed);
  }
  return embeds;
}

module.exports = { generateEmbeds };
