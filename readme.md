<h1>Voting Smart Contract</h1>
Un smart contract Ethereum de vote permettant aux utilisateurs de proposer et de voter pour des propositions. Ce contrat permet également de contrôler le processus de vote et de s'assurer que seuls les électeurs enregistrés peuvent voter.

<h1>Tests</h1>
Ce projet inclut des tests automatisés pour les fonctionnalités les plus importantes du contrat. Les tests sont écrits en JavaScript et utilisent les bibliothèques Mocha et Chai pour les assertions. Nous avons également utilisé la bibliothèque OpenZeppelin Test Helpers pour faciliter l'écriture des tests.

Les tests couvrent les aspects suivants du contrat de vote:

<h1>Tests Getters</h1>
Les tests de cette catégorie vérifient que les fonctions de récupération des informations fonctionnent correctement. Par exemple, les tests vérifient que les votants enregistrés peuvent être récupérés, que les propositions peuvent être récupérées et que les électeurs non enregistrés ne peuvent pas accéder à ces informations.

<h1>Voter Registered</h1>

Les tests de cette catégorie vérifient le processus d'enregistrement des électeurs. Par exemple, les tests vérifient que seuls les propriétaires peuvent ajouter des électeurs et que les électeurs ne peuvent être ajoutés qu'une seule fois.

<h1>start proposal Workflow</h1>

Les tests vérifient que le propriétaire du contrat peux lancer la période de soumission des propositions et que les propositions ne peuvent être soumises que pendant cette période.

<h1>add a proposal</h1>

Les tests de cette catégorie vérifient que les propositions peuvent être ajoutées avec succès et que les champs de description ne peuvent pas être laissés vides.

<h1>end proposal session</h1>

Les tests de cette catégorie vérifient que les propriétaires peuvent mettre fin à la session de proposition et qu'aucune proposition ne peut être soumise après la fin de cette session.

<h1>start voting session</h1>
Ce test vérifie que la fonction startVotingSession ne peut pas être appelée si l'état du workflow n'est pas correct. Il vérifie également que la fonction modifie correctement l'état du workflow.

<h1>set vote</h1>
Ce test vérifie que la fonction setVote ne peut pas être appelée si l'état du workflow n'est pas correct ou si le votant a déjà voté. Il vérifie également que la fonction modifie correctement l'état du votant et le comptage des votes.

<h1>end voting session</h1>
Ce test vérifie que la fonction endVotingSession ne peut pas être appelée si l'état du workflow n'est pas correct. Il vérifie également que la fonction modifie correctement l'état du workflow.

<h1>tally votes</h1>
Ce test vérifie que la fonction tallyVotes ne peut pas être appelée si l'état du workflow n'est pas correct. Il vérifie également que la fonction calcule correctement le décompte des votes.

<hr>
Comment exécuter les tests
Les tests peuvent être exécutés en utilisant Truffle. Voici les étapes à suivre :

Clonez le dépôt.
Assurez-vous que Truffle est installé sur votre système.
Ouvrez une ligne de commande dans le dossier racine du projet.
Lancez la commande truffle test.
Les tests s'exécuteront et afficheront les résultats dans votre console.