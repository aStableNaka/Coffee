/*
	To find the rank of player (p), query {bpbal:{$gt:p.bpbal}}
	Edit: This will not work
*/

/*
	Given a ranking model like this,
	here is a table of what a value/non-value
	in each attribute means:

	rank:{
		playerAbove: "987213981748297"
		playerBelow: ""
	}

		| pA-f		| pA-t 		|
	pB-f	| Unranked		| Last Place	|
	pB-t	| First Place	| Ranked

	Terms:
		LPP - Last place player
		FPP - First place player

	When (Inserting/Updating) a new document (G):
		f-a:
			if not G.playerAbove:
				set G.playerAbove to LPP.id;
			Let H =  Documents[G.playerAbove]
			while( G.bal > H.bal ):
				H = Documents[H.playerAbove]
			G.playerAbove = H.playerAbove
			H.playerAbove = G.id
			G.playerBelow = H.id


	When [Updating] a new document [H],
*/