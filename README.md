## Memory game

### Deployed at https://alflen.iandi.dev

### What is it?

A card memory game where you have to click the cards with the same image on them, but the cards are shown cover up! You can only look at cards for short period of time and have to click two cards with the same image
in order for them to dissappear. You win when you eliminate all cards from the field. The game starts with a 3x4 field.

In this version the pictures you see on the cards are funny cats!

### How to use

Everything is straightforward: you open the game and see a 3x4 field of cards flipped cover up. You can press on the card to flip it image up and then you can press on any other card yo flip it image up as well.
If flipped cards have same images, they will disappear. Otherwise, they will be turned back. If you have only one card opened, you can flip it back by clicking on it. When the field is cleared, you will be
offered a restart, where you can also specify which field size you want. If you struggle to complete a field, there is a "Give up" button in the top right corner, which sends you to restart screen.

### How to run

Initialize a server, for example, using built-in Webstorm server. The app does not require any additional libraries, only javascript. The app runs on client-side mostly and uses the server to get the images.
