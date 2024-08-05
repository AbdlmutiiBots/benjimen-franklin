module.exports = {
  name: "ready",
  once: true,
 async execute(bot) {
    console.log(`󱚤 Logged in as ${bot.user.tag}`);

    await bot.application.commands.set(bot.commands.map(cmd => cmd.data.toJSON()));
    console.log(" Slash commands registered.");
  }
}
