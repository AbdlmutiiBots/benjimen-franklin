let { generateEmbeds } = require("../functions/pagination.js");

module.exports = {
  name: "interactionCreate",
  async execute(i, bot, db) {
    if (i.isCommand()) {
        const command = bot.commands.get(i.commandName);
        if (!command) return;

        try {
            await command.execute(i, db, bot);
        } catch (error) {
            console.error(error);
            await i.reply({ content: 'There was an error executing that command!', ephemeral: true });
        }
    } else if(i.isButton()) {
    // HANDLING COMPONENTS, SINCE A COMPONENT HANDLER IS NOT THE BEST IDEA.
   if(i.customId === "yep") {
    let userid = i.message.content;
    i.reply({ content: `<@${userid}> has been accepted successfully`, ephemeral: true });
    let userdata = db.get(`waitlist_${userid}`);

    db.remove(`waitlist_${userid}`);
    db.set(userid, userdata);
    bot.users.cache.get(userid).send(":white_check_mark: Congrats! Admins has accepted your application, now you can apply to any job!");
  } else if(i.customId === "nah") {
    let userid = i.message.content;
     i.reply({ content: `<@${userid}> has been rejected`, ephemeral: true });
    //let userdata = db.get(`waitlist_${userid}`);

    db.remove(`waitlist_${userid}`);
    bot.users.cache.get(userid).send("Unfortunately, admins has rejected your application.");
  }

  if(i.customId.startsWith("apply_")) {
    if(!db.get(i.user.id)) return i.reply({ephemeral: true, content: "You are not accepted yet!"});
    let user = db.get(i.user.id);
     let thread = bot.channels.cache.find(g => g.name === "hiring").threads.cache.get(i.customId.split("_")[1]);
    let timenow = handleTZ(user.timezone);
     let applyEmbed = new Discord.MessageEmbed()
     .setTitle(i.user.globalName)
     .setThumbnail(i.user.avatarURL({ dynamic: true }))
     .setDescription(user.portfolio)
     .setColor("#880c24")
     .addFields({ name: "Service", value: `<@&${user.role}>`}, {name: "Timezone", value: `${user.timezone} (${timenow}) `});
     let order = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setCustomId(`order_${i.user.id}_${i.customId.split("_")[1]}_${i.customId.split("_")[2]}`)
      .setLabel(`Hire ${i.user.globalName}`)
      .setStyle("PRIMARY"),
     new Discord.MessageButton()
      .setCustomId("rvs_" + i.user.id)
      .setLabel("Reviews")
      .setStyle("SECONDARY")
    )

    thread.send({ embeds: [applyEmbed], content: `${i.user} is applying!`, components: [order]})
  }

  if(i.customId.startsWith("order_")) {
    if(i.user.id !== i.customId.split("_")[3]) return i.reply({content: "You don't have the right permission", ephemeral: true});
     let thread = bot.channels.cache.find(g => g.name === "hiring").threads.cache.get(i.customId.split("_")[2]);
    let freelancer = bot.users.cache.get(i.customId.split("_")[1])
    
    i.guild.channels.create(`${freelancer.username}-${i.user.username}`, {
    parent: ordersp,
    permissionOverwrites: [
      {
        id: i.guild.roles.everyone.id, // Deny everyone else
        deny: ['VIEW_CHANNEL']
      },
      {
        id: i.user.id, // Allow the interaction user
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
      },
      {
        id: freelancer.id, // Allow the freelancer
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
      }
    ]
  }).then(async channel => {
    let emb = new Discord.MessageEmbed()
    .setTitle("A new request")
    .setDescription("After everything, please show " + freelancer.globalName + " apperiareion by doing `?rate @" + freelancer.username + " [number of stars] [a comment]`, to grab a recipt you can do `?recipt`")
    .setTimestamp()
    .setColor("#880c24");
    channel.send({ embeds: [emb], content: `${freelancer}, ${i.user}`});
    await thread.delete();
  }).catch(console.error);
}

  if(i.customId.startsWith("rvs_")) {
    let userId = i.customId.split("_")[1];
    let reviews = db.get(userId).reviews;
    let currentPage = 0;
    const embeds = generateEmbeds(reviews, i.user.avatarURL());

    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
          .setCustomId('previous')
          .setLabel('⇦')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === 0),
        new Discord.MessageButton()
          .setCustomId('next')
          .setLabel('⇨')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === embeds.length - 1)
      );

    await i.reply({
      embeds: [embeds[currentPage]],
      components: [row],
      ephemeral: true
    });

    const filter = (btnInt) => ['previous', 'next'].includes(btnInt.customId) && btnInt.user.id === i.user.id;
    const collector = i.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (btnInt) => {
      if (btnInt.customId === 'previous' && currentPage > 0) {
        currentPage--;
      } else if (btnInt.customId === 'next' && currentPage < embeds.length - 1) {
        currentPage++;
      }

      await btnInt.update({
        embeds: [embeds[currentPage]],
        components: [
          new Discord.MessageActionRow()
            .addComponents(
              new Discord.MessageButton()
                .setCustomId('previous')
                .setLabel('⇦')
                .setStyle('PRIMARY')
                .setDisabled(currentPage === 0),
              new Discord.MessageButton()
                .setCustomId('next')
                .setLabel('⇨')
                .setStyle('PRIMARY')
                .setDisabled(currentPage === embeds.length - 1)
            )
        ]
      });
    });

    collector.on('end', () => {
      i.editReply({
        components: []
      });
    });
  }
  }
  }
}
