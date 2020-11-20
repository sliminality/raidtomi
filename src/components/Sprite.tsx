/**
 * Sprites for Pokémon.
 * https://msikma.github.io/pokesprite/
 */
import * as React from "react"
import { ScreenReaderText } from "./ScreenReaderText"

type SpritePropsBySpecies = {
    type: "species"
    species: number
    slug?: undefined
    female?: undefined

    // Is the icon decorative or does it stand alone?
    isStandalone: boolean
    className?: string
}

type SpritePropsBySlug =
    | {
          type: "slug"
          species?: undefined
          slug: Slug
          female?: undefined
          isStandalone: boolean
          className?: string
      }
    | {
          // Female sprites.
          type: "slug"
          species?: undefined
          slug: FemaleSlug
          female?: true
          isStandalone: boolean
          className?: string
      }

type SpriteProps = SpritePropsBySpecies | SpritePropsBySlug

export function Sprite(props: SpriteProps): JSX.Element {
    const slug =
        props.type === "species" ? speciesToSlug[props.species - 1] : props.slug

    const className = `pokesprite pokemon ${slug} ${
        props.female ? "female" : ""
    }`.trim()

    const icon = (
        <span
            className={[props.className, className].join(" ")}
            aria-hidden={true}
        />
    )

    // If icon is standalone, include screen-reader text.
    if (props.isStandalone) {
        return (
            <span>
                {icon}
                <ScreenReaderText>{slug}</ScreenReaderText>
            </span>
        )
    } else {
        return icon
    }
}

type Slug =
    | "bulbasaur"
    | "ivysaur"
    | "venusaur"
    | "venusaur-mega"
    | "venusaur-gmax"
    | "charmander"
    | "charmeleon"
    | "charizard"
    | "charizard-gmax"
    | "charizard-mega-x"
    | "charizard-mega-y"
    | "squirtle"
    | "wartortle"
    | "blastoise"
    | "blastoise-mega"
    | "blastoise-gmax"
    | "caterpie"
    | "metapod"
    | "butterfree"
    | "butterfree-gmax"
    | "weedle"
    | "kakuna"
    | "beedrill"
    | "beedrill-mega"
    | "pidgey"
    | "pidgeotto"
    | "pidgeot"
    | "pidgeot-mega"
    | "rattata"
    | "rattata-alola"
    | "raticate"
    | "raticate-alola"
    | "raticate-totem"
    | "raticate-totem-alola"
    | "spearow"
    | "fearow"
    | "ekans"
    | "arbok"
    | "pikachu"
    | "pikachu-alola-cap"
    | "pikachu-belle"
    | "pikachu-cosplay"
    | "pikachu-gmax"
    | "pikachu-hoenn-cap"
    | "pikachu-kalos-cap"
    | "pikachu-libre"
    | "pikachu-original-cap"
    | "pikachu-partner-cap"
    | "pikachu-phd"
    | "pikachu-pop-star"
    | "pikachu-rock-star"
    | "pikachu-sinnoh-cap"
    | "pikachu-starter"
    | "pikachu-unova-cap"
    | "pikachu-world-cap"
    | "raichu"
    | "raichu-alola"
    | "sandshrew"
    | "sandshrew-alola"
    | "sandslash"
    | "sandslash-alola"
    | "nidoran-f"
    | "nidorina"
    | "nidoqueen"
    | "nidoran-m"
    | "nidorino"
    | "nidoking"
    | "clefairy"
    | "clefable"
    | "vulpix"
    | "vulpix-alola"
    | "ninetales"
    | "ninetales-alola"
    | "jigglypuff"
    | "wigglytuff"
    | "zubat"
    | "golbat"
    | "oddish"
    | "gloom"
    | "vileplume"
    | "paras"
    | "parasect"
    | "venonat"
    | "venomoth"
    | "diglett"
    | "diglett-alola"
    | "dugtrio"
    | "dugtrio-alola"
    | "meowth"
    | "meowth-alola"
    | "meowth-galar"
    | "meowth-gmax"
    | "persian"
    | "persian-alola"
    | "psyduck"
    | "golduck"
    | "mankey"
    | "primeape"
    | "growlithe"
    | "arcanine"
    | "poliwag"
    | "poliwhirl"
    | "poliwrath"
    | "abra"
    | "kadabra"
    | "alakazam"
    | "alakazam-mega"
    | "machop"
    | "machoke"
    | "machamp"
    | "machamp-gmax"
    | "bellsprout"
    | "weepinbell"
    | "victreebel"
    | "tentacool"
    | "tentacruel"
    | "geodude"
    | "geodude-alola"
    | "graveler"
    | "graveler-alola"
    | "golem"
    | "golem-alola"
    | "ponyta"
    | "ponyta-galar"
    | "rapidash"
    | "rapidash-galar"
    | "slowpoke"
    | "slowpoke-galar"
    | "slowbro"
    | "slowbro-mega"
    | "slowbro-galar"
    | "magnemite"
    | "magneton"
    | "farfetchd"
    | "farfetchd-galar"
    | "doduo"
    | "dodrio"
    | "seel"
    | "dewgong"
    | "grimer"
    | "grimer-alola"
    | "muk"
    | "muk-alola"
    | "shellder"
    | "cloyster"
    | "gastly"
    | "haunter"
    | "gengar"
    | "gengar-gmax"
    | "gengar-mega"
    | "onix"
    | "drowzee"
    | "hypno"
    | "krabby"
    | "kingler"
    | "kingler-gmax"
    | "voltorb"
    | "electrode"
    | "exeggcute"
    | "exeggutor"
    | "exeggutor-alola"
    | "cubone"
    | "marowak"
    | "marowak-alola"
    | "marowak-totem"
    | "marowak-totem-alola"
    | "hitmonlee"
    | "hitmonchan"
    | "lickitung"
    | "koffing"
    | "weezing"
    | "weezing-galar"
    | "rhyhorn"
    | "rhydon"
    | "chansey"
    | "tangela"
    | "kangaskhan"
    | "kangaskhan-mega"
    | "horsea"
    | "seadra"
    | "goldeen"
    | "seaking"
    | "staryu"
    | "starmie"
    | "mr-mime"
    | "mr-mime-galar"
    | "scyther"
    | "jynx"
    | "electabuzz"
    | "magmar"
    | "pinsir"
    | "pinsir-mega"
    | "tauros"
    | "magikarp"
    | "gyarados"
    | "gyarados-mega"
    | "lapras"
    | "lapras-gmax"
    | "ditto"
    | "eevee"
    | "eevee-gmax"
    | "eevee-starter"
    | "vaporeon"
    | "jolteon"
    | "flareon"
    | "porygon"
    | "omanyte"
    | "omastar"
    | "kabuto"
    | "kabutops"
    | "aerodactyl"
    | "aerodactyl-mega"
    | "snorlax"
    | "snorlax-gmax"
    | "articuno"
    | "zapdos"
    | "moltres"
    | "dratini"
    | "dragonair"
    | "dragonite"
    | "mewtwo"
    | "mewtwo-mega-x"
    | "mewtwo-mega-y"
    | "mew"
    | "chikorita"
    | "bayleef"
    | "meganium"
    | "cyndaquil"
    | "quilava"
    | "typhlosion"
    | "totodile"
    | "croconaw"
    | "feraligatr"
    | "sentret"
    | "furret"
    | "hoothoot"
    | "noctowl"
    | "ledyba"
    | "ledian"
    | "spinarak"
    | "ariados"
    | "crobat"
    | "chinchou"
    | "lanturn"
    | "pichu"
    | "pichu-spiky-eared"
    | "cleffa"
    | "igglybuff"
    | "togepi"
    | "togetic"
    | "natu"
    | "xatu"
    | "mareep"
    | "flaaffy"
    | "ampharos"
    | "ampharos-mega"
    | "bellossom"
    | "marill"
    | "azumarill"
    | "sudowoodo"
    | "politoed"
    | "hoppip"
    | "skiploom"
    | "jumpluff"
    | "aipom"
    | "sunkern"
    | "sunflora"
    | "yanma"
    | "wooper"
    | "quagsire"
    | "espeon"
    | "umbreon"
    | "murkrow"
    | "slowking"
    | "misdreavus"
    | "unown"
    | "unown-a"
    | "unown-b"
    | "unown-c"
    | "unown-d"
    | "unown-e"
    | "unown-exclamation"
    | "unown-f"
    | "unown-g"
    | "unown-h"
    | "unown-i"
    | "unown-j"
    | "unown-k"
    | "unown-l"
    | "unown-m"
    | "unown-n"
    | "unown-o"
    | "unown-p"
    | "unown-q"
    | "unown-question"
    | "unown-r"
    | "unown-s"
    | "unown-t"
    | "unown-u"
    | "unown-v"
    | "unown-w"
    | "unown-x"
    | "unown-y"
    | "unown-z"
    | "wobbuffet"
    | "girafarig"
    | "pineco"
    | "forretress"
    | "dunsparce"
    | "gligar"
    | "steelix"
    | "steelix-mega"
    | "snubbull"
    | "granbull"
    | "qwilfish"
    | "scizor"
    | "scizor-mega"
    | "shuckle"
    | "heracross"
    | "heracross-mega"
    | "sneasel"
    | "teddiursa"
    | "ursaring"
    | "slugma"
    | "magcargo"
    | "swinub"
    | "piloswine"
    | "corsola"
    | "corsola-galar"
    | "remoraid"
    | "octillery"
    | "delibird"
    | "mantine"
    | "skarmory"
    | "houndour"
    | "houndoom"
    | "houndoom-mega"
    | "kingdra"
    | "phanpy"
    | "donphan"
    | "porygon2"
    | "stantler"
    | "smeargle"
    | "tyrogue"
    | "hitmontop"
    | "smoochum"
    | "elekid"
    | "magby"
    | "miltank"
    | "blissey"
    | "raikou"
    | "entei"
    | "suicune"
    | "larvitar"
    | "pupitar"
    | "tyranitar"
    | "tyranitar-mega"
    | "lugia"
    | "ho-oh"
    | "celebi"
    | "treecko"
    | "grovyle"
    | "sceptile"
    | "sceptile-mega"
    | "torchic"
    | "combusken"
    | "blaziken"
    | "blaziken-mega"
    | "mudkip"
    | "marshtomp"
    | "swampert"
    | "swampert-mega"
    | "poochyena"
    | "mightyena"
    | "zigzagoon"
    | "zigzagoon-galar"
    | "linoone"
    | "linoone-galar"
    | "wurmple"
    | "silcoon"
    | "beautifly"
    | "cascoon"
    | "dustox"
    | "lotad"
    | "lombre"
    | "ludicolo"
    | "seedot"
    | "nuzleaf"
    | "shiftry"
    | "taillow"
    | "swellow"
    | "wingull"
    | "pelipper"
    | "ralts"
    | "kirlia"
    | "gardevoir"
    | "gardevoir-mega"
    | "surskit"
    | "masquerain"
    | "shroomish"
    | "breloom"
    | "slakoth"
    | "vigoroth"
    | "slaking"
    | "nincada"
    | "ninjask"
    | "shedinja"
    | "whismur"
    | "loudred"
    | "exploud"
    | "makuhita"
    | "hariyama"
    | "azurill"
    | "nosepass"
    | "skitty"
    | "delcatty"
    | "sableye"
    | "sableye-mega"
    | "mawile"
    | "mawile-mega"
    | "aron"
    | "lairon"
    | "aggron"
    | "aggron-mega"
    | "meditite"
    | "medicham"
    | "medicham-mega"
    | "electrike"
    | "manectric"
    | "manectric-mega"
    | "plusle"
    | "minun"
    | "volbeat"
    | "illumise"
    | "roselia"
    | "gulpin"
    | "swalot"
    | "carvanha"
    | "sharpedo"
    | "sharpedo-mega"
    | "wailmer"
    | "wailord"
    | "numel"
    | "camerupt"
    | "camerupt-mega"
    | "torkoal"
    | "spoink"
    | "grumpig"
    | "spinda"
    | "spinda-blank"
    | "spinda-filled"
    | "trapinch"
    | "vibrava"
    | "flygon"
    | "cacnea"
    | "cacturne"
    | "swablu"
    | "altaria"
    | "altaria-mega"
    | "zangoose"
    | "seviper"
    | "lunatone"
    | "solrock"
    | "barboach"
    | "whiscash"
    | "corphish"
    | "crawdaunt"
    | "baltoy"
    | "claydol"
    | "lileep"
    | "cradily"
    | "anorith"
    | "armaldo"
    | "feebas"
    | "milotic"
    | "castform"
    | "castform-rainy"
    | "castform-snowy"
    | "castform-sunny"
    | "kecleon"
    | "shuppet"
    | "banette"
    | "banette-mega"
    | "duskull"
    | "dusclops"
    | "tropius"
    | "chimecho"
    | "absol"
    | "absol-mega"
    | "wynaut"
    | "snorunt"
    | "glalie"
    | "glalie-mega"
    | "spheal"
    | "sealeo"
    | "walrein"
    | "clamperl"
    | "huntail"
    | "gorebyss"
    | "relicanth"
    | "luvdisc"
    | "bagon"
    | "shelgon"
    | "salamence"
    | "salamence-mega"
    | "beldum"
    | "metang"
    | "metagross"
    | "metagross-mega"
    | "regirock"
    | "regice"
    | "registeel"
    | "latias"
    | "latias-mega"
    | "latios"
    | "latios-mega"
    | "kyogre"
    | "kyogre-primal"
    | "groudon"
    | "groudon-primal"
    | "rayquaza"
    | "rayquaza-mega"
    | "jirachi"
    | "deoxys"
    | "deoxys-normal"
    | "deoxys-attack"
    | "deoxys-defense"
    | "deoxys-speed"
    | "turtwig"
    | "grotle"
    | "torterra"
    | "chimchar"
    | "monferno"
    | "infernape"
    | "piplup"
    | "prinplup"
    | "empoleon"
    | "starly"
    | "staravia"
    | "staraptor"
    | "bidoof"
    | "bibarel"
    | "kricketot"
    | "kricketune"
    | "shinx"
    | "luxio"
    | "luxray"
    | "budew"
    | "roserade"
    | "cranidos"
    | "rampardos"
    | "shieldon"
    | "bastiodon"
    | "burmy"
    | "burmy-plant"
    | "burmy-sandy"
    | "burmy-trash"
    | "wormadam"
    | "wormadam-plant"
    | "wormadam-sandy"
    | "wormadam-trash"
    | "mothim"
    | "mothim-plant"
    | "mothim-sandy"
    | "mothim-trash"
    | "combee"
    | "vespiquen"
    | "pachirisu"
    | "buizel"
    | "floatzel"
    | "cherubi"
    | "cherrim"
    | "cherrim-overcast"
    | "cherrim-sunshine"
    | "shellos"
    | "shellos-west"
    | "shellos-east"
    | "gastrodon"
    | "gastrodon-west"
    | "gastrodon-east"
    | "ambipom"
    | "drifloon"
    | "drifblim"
    | "buneary"
    | "lopunny"
    | "lopunny-mega"
    | "mismagius"
    | "honchkrow"
    | "glameow"
    | "purugly"
    | "chingling"
    | "stunky"
    | "skuntank"
    | "bronzor"
    | "bronzong"
    | "bonsly"
    | "mime-jr"
    | "happiny"
    | "chatot"
    | "spiritomb"
    | "gible"
    | "gabite"
    | "garchomp"
    | "garchomp-mega"
    | "munchlax"
    | "riolu"
    | "lucario"
    | "lucario-mega"
    | "hippopotas"
    | "hippowdon"
    | "skorupi"
    | "drapion"
    | "croagunk"
    | "toxicroak"
    | "carnivine"
    | "finneon"
    | "lumineon"
    | "mantyke"
    | "snover"
    | "abomasnow"
    | "abomasnow-mega"
    | "weavile"
    | "magnezone"
    | "lickilicky"
    | "rhyperior"
    | "tangrowth"
    | "electivire"
    | "magmortar"
    | "togekiss"
    | "yanmega"
    | "leafeon"
    | "glaceon"
    | "gliscor"
    | "mamoswine"
    | "porygon-z"
    | "gallade"
    | "gallade-mega"
    | "probopass"
    | "dusknoir"
    | "froslass"
    | "rotom"
    | "rotom-fan"
    | "rotom-frost"
    | "rotom-heat"
    | "rotom-mow"
    | "rotom-wash"
    | "uxie"
    | "mesprit"
    | "azelf"
    | "dialga"
    | "palkia"
    | "heatran"
    | "regigigas"
    | "giratina"
    | "giratina-altered"
    | "giratina-origin"
    | "cresselia"
    | "phione"
    | "manaphy"
    | "darkrai"
    | "shaymin"
    | "shaymin-land"
    | "shaymin-sky"
    | "arceus"
    | "arceus-normal"
    | "arceus-unknown"
    | "arceus-bug"
    | "arceus-dark"
    | "arceus-dragon"
    | "arceus-electric"
    | "arceus-fairy"
    | "arceus-fighting"
    | "arceus-fire"
    | "arceus-flying"
    | "arceus-ghost"
    | "arceus-grass"
    | "arceus-ground"
    | "arceus-ice"
    | "arceus-poison"
    | "arceus-psychic"
    | "arceus-rock"
    | "arceus-steel"
    | "arceus-water"
    | "victini"
    | "snivy"
    | "servine"
    | "serperior"
    | "tepig"
    | "pignite"
    | "emboar"
    | "oshawott"
    | "dewott"
    | "samurott"
    | "patrat"
    | "watchog"
    | "lillipup"
    | "herdier"
    | "stoutland"
    | "purrloin"
    | "liepard"
    | "pansage"
    | "simisage"
    | "pansear"
    | "simisear"
    | "panpour"
    | "simipour"
    | "munna"
    | "musharna"
    | "pidove"
    | "tranquill"
    | "unfezant"
    | "blitzle"
    | "zebstrika"
    | "roggenrola"
    | "boldore"
    | "gigalith"
    | "woobat"
    | "swoobat"
    | "drilbur"
    | "excadrill"
    | "audino"
    | "audino-mega"
    | "timburr"
    | "gurdurr"
    | "conkeldurr"
    | "tympole"
    | "palpitoad"
    | "seismitoad"
    | "throh"
    | "sawk"
    | "sewaddle"
    | "swadloon"
    | "leavanny"
    | "venipede"
    | "whirlipede"
    | "scolipede"
    | "cottonee"
    | "whimsicott"
    | "petilil"
    | "lilligant"
    | "basculin"
    | "basculin-red-striped"
    | "basculin-blue-striped"
    | "sandile"
    | "krokorok"
    | "krookodile"
    | "darumaka"
    | "darumaka-galar"
    | "darmanitan"
    | "darmanitan-standard"
    | "darmanitan-galar"
    | "darmanitan-galar-zen"
    | "darmanitan-zen"
    | "maractus"
    | "dwebble"
    | "crustle"
    | "scraggy"
    | "scrafty"
    | "sigilyph"
    | "yamask"
    | "yamask-galar"
    | "cofagrigus"
    | "tirtouga"
    | "carracosta"
    | "archen"
    | "archeops"
    | "trubbish"
    | "garbodor"
    | "garbodor-gmax"
    | "zorua"
    | "zoroark"
    | "minccino"
    | "cinccino"
    | "gothita"
    | "gothorita"
    | "gothitelle"
    | "solosis"
    | "duosion"
    | "reuniclus"
    | "ducklett"
    | "swanna"
    | "vanillite"
    | "vanillish"
    | "vanilluxe"
    | "deerling"
    | "deerling-spring"
    | "deerling-autumn"
    | "deerling-summer"
    | "deerling-winter"
    | "sawsbuck"
    | "sawsbuck-spring"
    | "sawsbuck-autumn"
    | "sawsbuck-summer"
    | "sawsbuck-winter"
    | "emolga"
    | "karrablast"
    | "escavalier"
    | "foongus"
    | "amoonguss"
    | "frillish"
    | "jellicent"
    | "alomomola"
    | "joltik"
    | "galvantula"
    | "ferroseed"
    | "ferrothorn"
    | "klink"
    | "klang"
    | "klinklang"
    | "tynamo"
    | "eelektrik"
    | "eelektross"
    | "elgyem"
    | "beheeyem"
    | "litwick"
    | "lampent"
    | "chandelure"
    | "axew"
    | "fraxure"
    | "haxorus"
    | "cubchoo"
    | "beartic"
    | "cryogonal"
    | "shelmet"
    | "accelgor"
    | "stunfisk"
    | "stunfisk-galar"
    | "mienfoo"
    | "mienshao"
    | "druddigon"
    | "golett"
    | "golurk"
    | "pawniard"
    | "bisharp"
    | "bouffalant"
    | "rufflet"
    | "braviary"
    | "vullaby"
    | "mandibuzz"
    | "heatmor"
    | "durant"
    | "deino"
    | "zweilous"
    | "hydreigon"
    | "larvesta"
    | "volcarona"
    | "cobalion"
    | "terrakion"
    | "virizion"
    | "tornadus"
    | "tornadus-incarnate"
    | "tornadus-therian"
    | "thundurus"
    | "thundurus-incarnate"
    | "thundurus-therian"
    | "reshiram"
    | "zekrom"
    | "landorus"
    | "landorus-incarnate"
    | "landorus-therian"
    | "kyurem"
    | "kyurem-black"
    | "kyurem-white"
    | "keldeo"
    | "keldeo-ordinary"
    | "keldeo-resolute"
    | "meloetta"
    | "meloetta-aria"
    | "meloetta-pirouette"
    | "genesect"
    | "genesect-burn"
    | "genesect-chill"
    | "genesect-douse"
    | "genesect-shock"
    | "genesect-standard"
    | "chespin"
    | "quilladin"
    | "chesnaught"
    | "fennekin"
    | "braixen"
    | "delphox"
    | "froakie"
    | "frogadier"
    | "greninja"
    | "greninja-ash"
    | "greninja-battle-bond"
    | "bunnelby"
    | "diggersby"
    | "fletchling"
    | "fletchinder"
    | "talonflame"
    | "scatterbug"
    | "scatterbug-archipelago"
    | "scatterbug-continental"
    | "scatterbug-elegant"
    | "scatterbug-fancy"
    | "scatterbug-garden"
    | "scatterbug-high-plains"
    | "scatterbug-icy-snow"
    | "scatterbug-jungle"
    | "scatterbug-marine"
    | "scatterbug-meadow"
    | "scatterbug-modern"
    | "scatterbug-monsoon"
    | "scatterbug-ocean"
    | "scatterbug-poke-ball"
    | "scatterbug-polar"
    | "scatterbug-river"
    | "scatterbug-sandstorm"
    | "scatterbug-savanna"
    | "scatterbug-sun"
    | "scatterbug-tundra"
    | "spewpa"
    | "spewpa-archipelago"
    | "spewpa-continental"
    | "spewpa-elegant"
    | "spewpa-fancy"
    | "spewpa-garden"
    | "spewpa-high-plains"
    | "spewpa-icy-snow"
    | "spewpa-jungle"
    | "spewpa-marine"
    | "spewpa-meadow"
    | "spewpa-modern"
    | "spewpa-monsoon"
    | "spewpa-ocean"
    | "spewpa-poke-ball"
    | "spewpa-polar"
    | "spewpa-river"
    | "spewpa-sandstorm"
    | "spewpa-savanna"
    | "spewpa-sun"
    | "spewpa-tundra"
    | "vivillon"
    | "vivillon-meadow"
    | "vivillon-archipelago"
    | "vivillon-continental"
    | "vivillon-elegant"
    | "vivillon-fancy"
    | "vivillon-garden"
    | "vivillon-high-plains"
    | "vivillon-icy-snow"
    | "vivillon-jungle"
    | "vivillon-marine"
    | "vivillon-modern"
    | "vivillon-monsoon"
    | "vivillon-ocean"
    | "vivillon-poke-ball"
    | "vivillon-polar"
    | "vivillon-river"
    | "vivillon-sandstorm"
    | "vivillon-savanna"
    | "vivillon-sun"
    | "vivillon-tundra"
    | "litleo"
    | "pyroar"
    | "flabebe"
    | "flabebe-red"
    | "flabebe-blue"
    | "flabebe-orange"
    | "flabebe-white"
    | "flabebe-yellow"
    | "floette"
    | "floette-red"
    | "floette-blue"
    | "floette-eternal"
    | "floette-orange"
    | "floette-white"
    | "floette-yellow"
    | "florges"
    | "florges-red"
    | "florges-blue"
    | "florges-orange"
    | "florges-white"
    | "florges-yellow"
    | "skiddo"
    | "gogoat"
    | "pancham"
    | "pangoro"
    | "furfrou"
    | "furfrou-natural"
    | "furfrou-dandy"
    | "furfrou-debutante"
    | "furfrou-diamond"
    | "furfrou-heart"
    | "furfrou-kabuki"
    | "furfrou-la-reine"
    | "furfrou-matron"
    | "furfrou-pharaoh"
    | "furfrou-star"
    | "espurr"
    | "meowstic"
    | "honedge"
    | "doublade"
    | "aegislash"
    | "aegislash-shield"
    | "aegislash-blade"
    | "spritzee"
    | "aromatisse"
    | "swirlix"
    | "slurpuff"
    | "inkay"
    | "malamar"
    | "binacle"
    | "barbaracle"
    | "skrelp"
    | "dragalge"
    | "clauncher"
    | "clawitzer"
    | "helioptile"
    | "heliolisk"
    | "tyrunt"
    | "tyrantrum"
    | "amaura"
    | "aurorus"
    | "sylveon"
    | "hawlucha"
    | "dedenne"
    | "carbink"
    | "goomy"
    | "sliggoo"
    | "goodra"
    | "klefki"
    | "phantump"
    | "trevenant"
    | "pumpkaboo"
    | "pumpkaboo-average"
    | "pumpkaboo-large"
    | "pumpkaboo-small"
    | "pumpkaboo-super"
    | "gourgeist"
    | "gourgeist-average"
    | "gourgeist-large"
    | "gourgeist-small"
    | "gourgeist-super"
    | "bergmite"
    | "avalugg"
    | "noibat"
    | "noivern"
    | "xerneas"
    | "xerneas-neutral"
    | "xerneas-active"
    | "yveltal"
    | "zygarde-10"
    | "zygarde"
    | "zygarde-50"
    | "zygarde-complete"
    | "diancie"
    | "diancie-mega"
    | "hoopa"
    | "hoopa-unbound"
    | "volcanion"
    | "rowlet"
    | "dartrix"
    | "decidueye"
    | "litten"
    | "torracat"
    | "incineroar"
    | "popplio"
    | "brionne"
    | "primarina"
    | "pikipek"
    | "trumbeak"
    | "toucannon"
    | "yungoos"
    | "gumshoos"
    | "gumshoos-totem"
    | "grubbin"
    | "charjabug"
    | "vikavolt"
    | "vikavolt-totem"
    | "crabrawler"
    | "crabominable"
    | "oricorio"
    | "oricorio-baile"
    | "oricorio-pau"
    | "oricorio-pom-pom"
    | "oricorio-sensu"
    | "cutiefly"
    | "ribombee"
    | "ribombee-totem"
    | "rockruff"
    | "rockruff-own-tempo"
    | "lycanroc"
    | "lycanroc-midday"
    | "lycanroc-dusk"
    | "lycanroc-midnight"
    | "wishiwashi"
    | "wishiwashi-solo"
    | "wishiwashi-school"
    | "mareanie"
    | "toxapex"
    | "mudbray"
    | "mudsdale"
    | "dewpider"
    | "araquanid"
    | "araquanid-totem"
    | "fomantis"
    | "lurantis"
    | "lurantis-totem"
    | "morelull"
    | "shiinotic"
    | "salandit"
    | "salazzle"
    | "salazzle-totem"
    | "stufful"
    | "bewear"
    | "bounsweet"
    | "steenee"
    | "tsareena"
    | "comfey"
    | "oranguru"
    | "passimian"
    | "wimpod"
    | "golisopod"
    | "sandygast"
    | "palossand"
    | "pyukumuku"
    | "type-null"
    | "silvally"
    | "silvally-normal"
    | "silvally-bug"
    | "silvally-dark"
    | "silvally-dragon"
    | "silvally-electric"
    | "silvally-fairy"
    | "silvally-fighting"
    | "silvally-fire"
    | "silvally-flying"
    | "silvally-ghost"
    | "silvally-grass"
    | "silvally-ground"
    | "silvally-ice"
    | "silvally-poison"
    | "silvally-psychic"
    | "silvally-rock"
    | "silvally-steel"
    | "silvally-water"
    | "minior"
    | "minior-blue-meteor"
    | "minior-green-meteor"
    | "minior-indigo-meteor"
    | "minior-orange-meteor"
    | "minior-red-meteor"
    | "minior-violet-meteor"
    | "minior-yellow-meteor"
    | "minior-blue"
    | "minior-blue-gen7"
    | "minior-green-gen7"
    | "minior-indigo-gen7"
    | "minior-orange-gen7"
    | "minior-red-gen7"
    | "minior-violet-gen7"
    | "minior-yellow-gen7"
    | "minior-green"
    | "minior-indigo"
    | "minior-orange"
    | "minior-red"
    | "minior-violet"
    | "minior-yellow"
    | "komala"
    | "turtonator"
    | "togedemaru"
    | "togedemaru-totem"
    | "mimikyu"
    | "mimikyu-busted"
    | "mimikyu-disguised"
    | "mimikyu-totem"
    | "mimikyu-totem-busted"
    | "mimikyu-totem-disguised"
    | "bruxish"
    | "drampa"
    | "dhelmise"
    | "jangmo-o"
    | "hakamo-o"
    | "kommo-o"
    | "kommo-o-totem"
    | "tapu-koko"
    | "tapu-lele"
    | "tapu-bulu"
    | "tapu-fini"
    | "cosmog"
    | "cosmoem"
    | "solgaleo"
    | "lunala"
    | "nihilego"
    | "buzzwole"
    | "pheromosa"
    | "xurkitree"
    | "celesteela"
    | "kartana"
    | "guzzlord"
    | "necrozma"
    | "necrozma-dawn"
    | "necrozma-dusk"
    | "necrozma-ultra"
    | "magearna"
    | "magearna-original"
    | "marshadow"
    | "marshadow-gen7"
    | "poipole"
    | "naganadel"
    | "stakataka"
    | "blacephalon"
    | "zeraora"
    | "meltan"
    | "melmetal"
    | "melmetal-gmax"
    | "grookey"
    | "thwackey"
    | "rillaboom"
    | "rillaboom-gmax"
    | "scorbunny"
    | "raboot"
    | "cinderace"
    | "cinderace-gmax"
    | "sobble"
    | "drizzile"
    | "inteleon"
    | "inteleon-gmax"
    | "skwovet"
    | "greedent"
    | "rookidee"
    | "corvisquire"
    | "corviknight"
    | "corviknight-gmax"
    | "blipbug"
    | "dottler"
    | "orbeetle"
    | "orbeetle-gmax"
    | "nickit"
    | "thievul"
    | "gossifleur"
    | "eldegoss"
    | "wooloo"
    | "dubwool"
    | "chewtle"
    | "drednaw"
    | "drednaw-gmax"
    | "yamper"
    | "boltund"
    | "rolycoly"
    | "carkol"
    | "coalossal"
    | "coalossal-gmax"
    | "applin"
    | "flapple"
    | "flapple-gmax"
    | "appletun"
    | "silicobra"
    | "sandaconda"
    | "sandaconda-gmax"
    | "cramorant"
    | "cramorant-gorging"
    | "cramorant-gulping"
    | "arrokuda"
    | "barraskewda"
    | "toxel"
    | "toxtricity"
    | "toxtricity-amped"
    | "toxtricity-gmax"
    | "toxtricity-low-key-gmax"
    | "toxtricity-low-key"
    | "sizzlipede"
    | "centiskorch"
    | "centiskorch-gmax"
    | "clobbopus"
    | "grapploct"
    | "sinistea"
    | "polteageist"
    | "hatenna"
    | "hattrem"
    | "hatterene"
    | "hatterene-gmax"
    | "impidimp"
    | "morgrem"
    | "grimmsnarl"
    | "grimmsnarl-gmax"
    | "obstagoon"
    | "perrserker"
    | "cursola"
    | "sirfetchd"
    | "mr-rime"
    | "runerigus"
    | "milcery"
    | "alcremie"
    | "alcremie-caramel-swirl-berry"
    | "alcremie-caramel-swirl-clover"
    | "alcremie-caramel-swirl-flower"
    | "alcremie-caramel-swirl-love"
    | "alcremie-caramel-swirl-plain"
    | "alcremie-caramel-swirl-ribbon"
    | "alcremie-caramel-swirl-star"
    | "alcremie-caramel-swirl-strawberry"
    | "alcremie-gmax"
    | "alcremie-lemon-cream-berry"
    | "alcremie-lemon-cream-clover"
    | "alcremie-lemon-cream-flower"
    | "alcremie-lemon-cream-love"
    | "alcremie-lemon-cream-plain"
    | "alcremie-lemon-cream-ribbon"
    | "alcremie-lemon-cream-star"
    | "alcremie-lemon-cream-strawberry"
    | "alcremie-matcha-cream-berry"
    | "alcremie-matcha-cream-clover"
    | "alcremie-matcha-cream-flower"
    | "alcremie-matcha-cream-love"
    | "alcremie-matcha-cream-plain"
    | "alcremie-matcha-cream-ribbon"
    | "alcremie-matcha-cream-star"
    | "alcremie-matcha-cream-strawberry"
    | "alcremie-mint-cream-berry"
    | "alcremie-mint-cream-clover"
    | "alcremie-mint-cream-flower"
    | "alcremie-mint-cream-love"
    | "alcremie-mint-cream-plain"
    | "alcremie-mint-cream-ribbon"
    | "alcremie-mint-cream-star"
    | "alcremie-mint-cream-strawberry"
    | "alcremie-rainbow-swirl-berry"
    | "alcremie-rainbow-swirl-clover"
    | "alcremie-rainbow-swirl-flower"
    | "alcremie-rainbow-swirl-love"
    | "alcremie-rainbow-swirl-plain"
    | "alcremie-rainbow-swirl-ribbon"
    | "alcremie-rainbow-swirl-star"
    | "alcremie-rainbow-swirl-strawberry"
    | "alcremie-ruby-cream-berry"
    | "alcremie-ruby-cream-clover"
    | "alcremie-ruby-cream-flower"
    | "alcremie-ruby-cream-love"
    | "alcremie-ruby-cream-plain"
    | "alcremie-ruby-cream-ribbon"
    | "alcremie-ruby-cream-star"
    | "alcremie-ruby-cream-strawberry"
    | "alcremie-ruby-swirl-berry"
    | "alcremie-ruby-swirl-clover"
    | "alcremie-ruby-swirl-flower"
    | "alcremie-ruby-swirl-love"
    | "alcremie-ruby-swirl-plain"
    | "alcremie-ruby-swirl-ribbon"
    | "alcremie-ruby-swirl-star"
    | "alcremie-ruby-swirl-strawberry"
    | "alcremie-salted-cream-berry"
    | "alcremie-salted-cream-clover"
    | "alcremie-salted-cream-flower"
    | "alcremie-salted-cream-love"
    | "alcremie-salted-cream-plain"
    | "alcremie-salted-cream-ribbon"
    | "alcremie-salted-cream-star"
    | "alcremie-salted-cream-strawberry"
    | "alcremie-vanilla-cream-berry"
    | "alcremie-vanilla-cream-clover"
    | "alcremie-vanilla-cream-flower"
    | "alcremie-vanilla-cream-love"
    | "alcremie-vanilla-cream-plain"
    | "alcremie-vanilla-cream-ribbon"
    | "alcremie-vanilla-cream-star"
    | "alcremie-vanilla-cream-strawberry"
    | "falinks"
    | "pincurchin"
    | "snom"
    | "frosmoth"
    | "stonjourner"
    | "eiscue"
    | "eiscue-ice"
    | "eiscue-noice"
    | "indeedee"
    | "morpeko"
    | "morpeko-full-belly"
    | "morpeko-hangry"
    | "cufant"
    | "copperajah"
    | "copperajah-gmax"
    | "dracozolt"
    | "arctozolt"
    | "dracovish"
    | "arctovish"
    | "duraludon"
    | "duraludon-gmax"
    | "dreepy"
    | "drakloak"
    | "dragapult"
    | "zacian"
    | "zacian-hero-of-many-battles"
    | "zacian-crowned"
    | "zamazenta"
    | "zamazenta-hero-of-many-battles"
    | "zamazenta-crowned"
    | "eternatus"
    | "eternatus-eternamax"
    | "kubfu"
    | "urshifu"
    | "urshifu-gmax"
    | "urshifu-single-strike-gmax"
    | "urshifu-rapid-strike-gmax"
    | "zarude"
    | "zarude-dada"

export type FemaleSlug =
    | "pikachu"
    | "pikachu-alola-cap"
    | "pikachu-hoenn-cap"
    | "pikachu-kalos-cap"
    | "pikachu-original-cap"
    | "pikachu-partner-cap"
    | "pikachu-sinnoh-cap"
    | "pikachu-starter"
    | "pikachu-unova-cap"
    | "pikachu-world-cap"
    | "hippopotas"
    | "hippowdon"
    | "unfezant"
    | "frillish"
    | "jellicent"
    | "pyroar"
    | "meowstic"
    | "indeedee"

const speciesToSlug: Array<Slug> = [
    "bulbasaur",
    "ivysaur",
    "venusaur",
    "charmander",
    "charmeleon",
    "charizard",
    "squirtle",
    "wartortle",
    "blastoise",
    "caterpie",
    "metapod",
    "butterfree",
    "weedle",
    "kakuna",
    "beedrill",
    "pidgey",
    "pidgeotto",
    "pidgeot",
    "rattata",
    "raticate",
    "spearow",
    "fearow",
    "ekans",
    "arbok",
    "pikachu",
    "raichu",
    "sandshrew",
    "sandslash",
    "nidoran-f",
    "nidorina",
    "nidoqueen",
    "nidoran-m",
    "nidorino",
    "nidoking",
    "clefairy",
    "clefable",
    "vulpix",
    "ninetales",
    "jigglypuff",
    "wigglytuff",
    "zubat",
    "golbat",
    "oddish",
    "gloom",
    "vileplume",
    "paras",
    "parasect",
    "venonat",
    "venomoth",
    "diglett",
    "dugtrio",
    "meowth",
    "persian",
    "psyduck",
    "golduck",
    "mankey",
    "primeape",
    "growlithe",
    "arcanine",
    "poliwag",
    "poliwhirl",
    "poliwrath",
    "abra",
    "kadabra",
    "alakazam",
    "machop",
    "machoke",
    "machamp",
    "bellsprout",
    "weepinbell",
    "victreebel",
    "tentacool",
    "tentacruel",
    "geodude",
    "graveler",
    "golem",
    "ponyta",
    "rapidash",
    "slowpoke",
    "slowbro",
    "magnemite",
    "magneton",
    "farfetchd",
    "doduo",
    "dodrio",
    "seel",
    "dewgong",
    "grimer",
    "muk",
    "shellder",
    "cloyster",
    "gastly",
    "haunter",
    "gengar",
    "onix",
    "drowzee",
    "hypno",
    "krabby",
    "kingler",
    "voltorb",
    "electrode",
    "exeggcute",
    "exeggutor",
    "cubone",
    "marowak",
    "hitmonlee",
    "hitmonchan",
    "lickitung",
    "koffing",
    "weezing",
    "rhyhorn",
    "rhydon",
    "chansey",
    "tangela",
    "kangaskhan",
    "horsea",
    "seadra",
    "goldeen",
    "seaking",
    "staryu",
    "starmie",
    "mr-mime",
    "scyther",
    "jynx",
    "electabuzz",
    "magmar",
    "pinsir",
    "tauros",
    "magikarp",
    "gyarados",
    "lapras",
    "ditto",
    "eevee",
    "vaporeon",
    "jolteon",
    "flareon",
    "porygon",
    "omanyte",
    "omastar",
    "kabuto",
    "kabutops",
    "aerodactyl",
    "snorlax",
    "articuno",
    "zapdos",
    "moltres",
    "dratini",
    "dragonair",
    "dragonite",
    "mewtwo",
    "mew",
    "chikorita",
    "bayleef",
    "meganium",
    "cyndaquil",
    "quilava",
    "typhlosion",
    "totodile",
    "croconaw",
    "feraligatr",
    "sentret",
    "furret",
    "hoothoot",
    "noctowl",
    "ledyba",
    "ledian",
    "spinarak",
    "ariados",
    "crobat",
    "chinchou",
    "lanturn",
    "pichu",
    "cleffa",
    "igglybuff",
    "togepi",
    "togetic",
    "natu",
    "xatu",
    "mareep",
    "flaaffy",
    "ampharos",
    "bellossom",
    "marill",
    "azumarill",
    "sudowoodo",
    "politoed",
    "hoppip",
    "skiploom",
    "jumpluff",
    "aipom",
    "sunkern",
    "sunflora",
    "yanma",
    "wooper",
    "quagsire",
    "espeon",
    "umbreon",
    "murkrow",
    "slowking",
    "misdreavus",
    "unown",
    "wobbuffet",
    "girafarig",
    "pineco",
    "forretress",
    "dunsparce",
    "gligar",
    "steelix",
    "snubbull",
    "granbull",
    "qwilfish",
    "scizor",
    "shuckle",
    "heracross",
    "sneasel",
    "teddiursa",
    "ursaring",
    "slugma",
    "magcargo",
    "swinub",
    "piloswine",
    "corsola",
    "remoraid",
    "octillery",
    "delibird",
    "mantine",
    "skarmory",
    "houndour",
    "houndoom",
    "kingdra",
    "phanpy",
    "donphan",
    "porygon2",
    "stantler",
    "smeargle",
    "tyrogue",
    "hitmontop",
    "smoochum",
    "elekid",
    "magby",
    "miltank",
    "blissey",
    "raikou",
    "entei",
    "suicune",
    "larvitar",
    "pupitar",
    "tyranitar",
    "lugia",
    "ho-oh",
    "celebi",
    "treecko",
    "grovyle",
    "sceptile",
    "torchic",
    "combusken",
    "blaziken",
    "mudkip",
    "marshtomp",
    "swampert",
    "poochyena",
    "mightyena",
    "zigzagoon",
    "linoone",
    "wurmple",
    "silcoon",
    "beautifly",
    "cascoon",
    "dustox",
    "lotad",
    "lombre",
    "ludicolo",
    "seedot",
    "nuzleaf",
    "shiftry",
    "taillow",
    "swellow",
    "wingull",
    "pelipper",
    "ralts",
    "kirlia",
    "gardevoir",
    "surskit",
    "masquerain",
    "shroomish",
    "breloom",
    "slakoth",
    "vigoroth",
    "slaking",
    "nincada",
    "ninjask",
    "shedinja",
    "whismur",
    "loudred",
    "exploud",
    "makuhita",
    "hariyama",
    "azurill",
    "nosepass",
    "skitty",
    "delcatty",
    "sableye",
    "mawile",
    "aron",
    "lairon",
    "aggron",
    "meditite",
    "medicham",
    "electrike",
    "manectric",
    "plusle",
    "minun",
    "volbeat",
    "illumise",
    "roselia",
    "gulpin",
    "swalot",
    "carvanha",
    "sharpedo",
    "wailmer",
    "wailord",
    "numel",
    "camerupt",
    "torkoal",
    "spoink",
    "grumpig",
    "spinda",
    "trapinch",
    "vibrava",
    "flygon",
    "cacnea",
    "cacturne",
    "swablu",
    "altaria",
    "zangoose",
    "seviper",
    "lunatone",
    "solrock",
    "barboach",
    "whiscash",
    "corphish",
    "crawdaunt",
    "baltoy",
    "claydol",
    "lileep",
    "cradily",
    "anorith",
    "armaldo",
    "feebas",
    "milotic",
    "castform",
    "kecleon",
    "shuppet",
    "banette",
    "duskull",
    "dusclops",
    "tropius",
    "chimecho",
    "absol",
    "wynaut",
    "snorunt",
    "glalie",
    "spheal",
    "sealeo",
    "walrein",
    "clamperl",
    "huntail",
    "gorebyss",
    "relicanth",
    "luvdisc",
    "bagon",
    "shelgon",
    "salamence",
    "beldum",
    "metang",
    "metagross",
    "regirock",
    "regice",
    "registeel",
    "latias",
    "latios",
    "kyogre",
    "groudon",
    "rayquaza",
    "jirachi",
    "deoxys",
    "turtwig",
    "grotle",
    "torterra",
    "chimchar",
    "monferno",
    "infernape",
    "piplup",
    "prinplup",
    "empoleon",
    "starly",
    "staravia",
    "staraptor",
    "bidoof",
    "bibarel",
    "kricketot",
    "kricketune",
    "shinx",
    "luxio",
    "luxray",
    "budew",
    "roserade",
    "cranidos",
    "rampardos",
    "shieldon",
    "bastiodon",
    "burmy",
    "wormadam",
    "mothim",
    "combee",
    "vespiquen",
    "pachirisu",
    "buizel",
    "floatzel",
    "cherubi",
    "cherrim",
    "shellos",
    "gastrodon",
    "ambipom",
    "drifloon",
    "drifblim",
    "buneary",
    "lopunny",
    "mismagius",
    "honchkrow",
    "glameow",
    "purugly",
    "chingling",
    "stunky",
    "skuntank",
    "bronzor",
    "bronzong",
    "bonsly",
    "mime-jr",
    "happiny",
    "chatot",
    "spiritomb",
    "gible",
    "gabite",
    "garchomp",
    "munchlax",
    "riolu",
    "lucario",
    "hippopotas",
    "hippowdon",
    "skorupi",
    "drapion",
    "croagunk",
    "toxicroak",
    "carnivine",
    "finneon",
    "lumineon",
    "mantyke",
    "snover",
    "abomasnow",
    "weavile",
    "magnezone",
    "lickilicky",
    "rhyperior",
    "tangrowth",
    "electivire",
    "magmortar",
    "togekiss",
    "yanmega",
    "leafeon",
    "glaceon",
    "gliscor",
    "mamoswine",
    "porygon-z",
    "gallade",
    "probopass",
    "dusknoir",
    "froslass",
    "rotom",
    "uxie",
    "mesprit",
    "azelf",
    "dialga",
    "palkia",
    "heatran",
    "regigigas",
    "giratina",
    "cresselia",
    "phione",
    "manaphy",
    "darkrai",
    "shaymin",
    "arceus",
    "victini",
    "snivy",
    "servine",
    "serperior",
    "tepig",
    "pignite",
    "emboar",
    "oshawott",
    "dewott",
    "samurott",
    "patrat",
    "watchog",
    "lillipup",
    "herdier",
    "stoutland",
    "purrloin",
    "liepard",
    "pansage",
    "simisage",
    "pansear",
    "simisear",
    "panpour",
    "simipour",
    "munna",
    "musharna",
    "pidove",
    "tranquill",
    "unfezant",
    "blitzle",
    "zebstrika",
    "roggenrola",
    "boldore",
    "gigalith",
    "woobat",
    "swoobat",
    "drilbur",
    "excadrill",
    "audino",
    "timburr",
    "gurdurr",
    "conkeldurr",
    "tympole",
    "palpitoad",
    "seismitoad",
    "throh",
    "sawk",
    "sewaddle",
    "swadloon",
    "leavanny",
    "venipede",
    "whirlipede",
    "scolipede",
    "cottonee",
    "whimsicott",
    "petilil",
    "lilligant",
    "basculin",
    "sandile",
    "krokorok",
    "krookodile",
    "darumaka",
    "darmanitan",
    "maractus",
    "dwebble",
    "crustle",
    "scraggy",
    "scrafty",
    "sigilyph",
    "yamask",
    "cofagrigus",
    "tirtouga",
    "carracosta",
    "archen",
    "archeops",
    "trubbish",
    "garbodor",
    "zorua",
    "zoroark",
    "minccino",
    "cinccino",
    "gothita",
    "gothorita",
    "gothitelle",
    "solosis",
    "duosion",
    "reuniclus",
    "ducklett",
    "swanna",
    "vanillite",
    "vanillish",
    "vanilluxe",
    "deerling",
    "sawsbuck",
    "emolga",
    "karrablast",
    "escavalier",
    "foongus",
    "amoonguss",
    "frillish",
    "jellicent",
    "alomomola",
    "joltik",
    "galvantula",
    "ferroseed",
    "ferrothorn",
    "klink",
    "klang",
    "klinklang",
    "tynamo",
    "eelektrik",
    "eelektross",
    "elgyem",
    "beheeyem",
    "litwick",
    "lampent",
    "chandelure",
    "axew",
    "fraxure",
    "haxorus",
    "cubchoo",
    "beartic",
    "cryogonal",
    "shelmet",
    "accelgor",
    "stunfisk",
    "mienfoo",
    "mienshao",
    "druddigon",
    "golett",
    "golurk",
    "pawniard",
    "bisharp",
    "bouffalant",
    "rufflet",
    "braviary",
    "vullaby",
    "mandibuzz",
    "heatmor",
    "durant",
    "deino",
    "zweilous",
    "hydreigon",
    "larvesta",
    "volcarona",
    "cobalion",
    "terrakion",
    "virizion",
    "tornadus",
    "thundurus",
    "reshiram",
    "zekrom",
    "landorus",
    "kyurem",
    "keldeo",
    "meloetta",
    "genesect",
    "chespin",
    "quilladin",
    "chesnaught",
    "fennekin",
    "braixen",
    "delphox",
    "froakie",
    "frogadier",
    "greninja",
    "bunnelby",
    "diggersby",
    "fletchling",
    "fletchinder",
    "talonflame",
    "scatterbug",
    "spewpa",
    "vivillon",
    "litleo",
    "pyroar",
    "flabebe",
    "floette",
    "florges",
    "skiddo",
    "gogoat",
    "pancham",
    "pangoro",
    "furfrou",
    "espurr",
    "meowstic",
    "honedge",
    "doublade",
    "aegislash",
    "spritzee",
    "aromatisse",
    "swirlix",
    "slurpuff",
    "inkay",
    "malamar",
    "binacle",
    "barbaracle",
    "skrelp",
    "dragalge",
    "clauncher",
    "clawitzer",
    "helioptile",
    "heliolisk",
    "tyrunt",
    "tyrantrum",
    "amaura",
    "aurorus",
    "sylveon",
    "hawlucha",
    "dedenne",
    "carbink",
    "goomy",
    "sliggoo",
    "goodra",
    "klefki",
    "phantump",
    "trevenant",
    "pumpkaboo",
    "gourgeist",
    "bergmite",
    "avalugg",
    "noibat",
    "noivern",
    "xerneas",
    "yveltal",
    "zygarde",
    "diancie",
    "hoopa",
    "volcanion",
    "rowlet",
    "dartrix",
    "decidueye",
    "litten",
    "torracat",
    "incineroar",
    "popplio",
    "brionne",
    "primarina",
    "pikipek",
    "trumbeak",
    "toucannon",
    "yungoos",
    "gumshoos",
    "grubbin",
    "charjabug",
    "vikavolt",
    "crabrawler",
    "crabominable",
    "oricorio",
    "cutiefly",
    "ribombee",
    "rockruff",
    "lycanroc",
    "wishiwashi",
    "mareanie",
    "toxapex",
    "mudbray",
    "mudsdale",
    "dewpider",
    "araquanid",
    "fomantis",
    "lurantis",
    "morelull",
    "shiinotic",
    "salandit",
    "salazzle",
    "stufful",
    "bewear",
    "bounsweet",
    "steenee",
    "tsareena",
    "comfey",
    "oranguru",
    "passimian",
    "wimpod",
    "golisopod",
    "sandygast",
    "palossand",
    "pyukumuku",
    "type-null",
    "silvally",
    "minior",
    "komala",
    "turtonator",
    "togedemaru",
    "mimikyu",
    "bruxish",
    "drampa",
    "dhelmise",
    "jangmo-o",
    "hakamo-o",
    "kommo-o",
    "tapu-koko",
    "tapu-lele",
    "tapu-bulu",
    "tapu-fini",
    "cosmog",
    "cosmoem",
    "solgaleo",
    "lunala",
    "nihilego",
    "buzzwole",
    "pheromosa",
    "xurkitree",
    "celesteela",
    "kartana",
    "guzzlord",
    "necrozma",
    "magearna",
    "marshadow",
    "poipole",
    "naganadel",
    "stakataka",
    "blacephalon",
    "zeraora",
    "meltan",
    "melmetal",
    "grookey",
    "thwackey",
    "rillaboom",
    "scorbunny",
    "raboot",
    "cinderace",
    "sobble",
    "drizzile",
    "inteleon",
    "skwovet",
    "greedent",
    "rookidee",
    "corvisquire",
    "corviknight",
    "blipbug",
    "dottler",
    "orbeetle",
    "nickit",
    "thievul",
    "gossifleur",
    "eldegoss",
    "wooloo",
    "dubwool",
    "chewtle",
    "drednaw",
    "yamper",
    "boltund",
    "rolycoly",
    "carkol",
    "coalossal",
    "applin",
    "flapple",
    "appletun",
    "silicobra",
    "sandaconda",
    "cramorant",
    "arrokuda",
    "barraskewda",
    "toxel",
    "toxtricity",
    "sizzlipede",
    "centiskorch",
    "clobbopus",
    "grapploct",
    "sinistea",
    "polteageist",
    "hatenna",
    "hattrem",
    "hatterene",
    "impidimp",
    "morgrem",
    "grimmsnarl",
    "obstagoon",
    "perrserker",
    "cursola",
    "sirfetchd",
    "mr-rime",
    "runerigus",
    "milcery",
    "alcremie",
    "falinks",
    "pincurchin",
    "snom",
    "frosmoth",
    "stonjourner",
    "eiscue",
    "indeedee",
    "morpeko",
    "cufant",
    "copperajah",
    "dracozolt",
    "arctozolt",
    "dracovish",
    "arctovish",
    "duraludon",
    "dreepy",
    "drakloak",
    "dragapult",
    "zacian",
    "zamazenta",
    "eternatus",
    "kubfu",
    "urshifu",
    "zarude",
]
