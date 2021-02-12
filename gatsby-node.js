const axios = require('axios');

const get = endpoint => axios.get(`https://pokeapi.co/api/v2${endpoint}`);

const getPokemonData = names =>
  Promise.all(
    names.map(async name => {
      const { data: pokemon } = await get(`/pokemon/${name}`);
      const abilities = await Promise.all(
        pokemon.abilities.map(async ({ ability: { name: abilityName } }) => {
          const { data: ability } = await get(`/ability/${abilityName}`);

          return ability;
        }) 
      );

      return { ...pokemon, abilities };
    })
  );

const { createFilePath } = require(`gatsby-source-filesystem`)
exports.onCreateNode = ({ node, getNode  }) => {
  console.log(`Node created of type "${node.internal.type}"`)
  // if (node.internal.type === `Mdx` || node.internal.type === `MdxPost` || node.internal.type === `MdxPage`) {
  //   console.log(createFilePath({ node, getNode, basePath: `pages` }))
  // }
}

exports.createPages = async ({ actions: { createPage } }) => {
  const allPokemon = await getPokemonData(['pikachu', 'charizard', 'squirtle']);

  // Create a page that lists all Pokémon.
  createPage({
    path: `/pokemon`,
    component: require.resolve('./src/templates/all-pokemon.js'),
    context: { allPokemon }
  });

  console.log("CREATE POKEMON PAGES")

  // Create a page for each Pokémon.
  allPokemon.forEach(pokemon => {
    createPage({
      path: `/pokemon/${pokemon.name}/`,
      component: require.resolve('./src/templates/pokemon.js'),
      context: { pokemon }
    });

   
  });
};