module.exports = {
  name: "threadCreate",
  async execute(ch, bot, db) {
let parent = bot.channels.cache.get(ch.parentId);

   if(parent.name === "hiring") {
      if(ch.appliedTags.length < 1) {
       ch.delete();
       bot.users.cache.get(ch.ownerId).send("You have to apply tags for your hiring post!");
       return;
    }
      let tags = ch.appliedTags.map(s => ch.parent.availableTags.find(t => t.id === s)).map(x => x.name);
      let roles = ch.guild.roles.cache.filter(role => tags.includes(role.name));
      
      let mentions = roles.map(role => `<@&${role.id}>`).join(', ');
      let apply = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setCustomId("apply_" + ch.id + "_" + ch.ownerId)
      .setLabel("APPLY")
      .setStyle("SUCCESS"),
    );

      ch.setLocked(true);
      ch.send({content: mentions, components: [apply]}).then(msg => msg.pin());
  }
  }
}
