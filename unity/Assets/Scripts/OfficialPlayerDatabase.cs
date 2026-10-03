using System;
using System.Collections.Generic;
using UnityEngine;

namespace RetroSoccer
{
    [Serializable]
    public class PlayerData
    {
        public string id;
        public int number;
        public string name;
        public string club;
        public string pos;
        public int pac;
        public int sho;
        public int pas;
        public int dri;
        public int def;
        public int phy;
        public int ovr;
    }

    public static class OfficialPlayerDatabase
    {
        public static readonly List<PlayerData> Players = new List<PlayerData>
        {
            // VOLUME I: Attackers & Wingers (001 - 025)
            new PlayerData { id = "001", number = 1, name = "Viktor Drake", club = "FC Capital", pos = "ST", pac = 82, sho = 92, pas = 65, dri = 78, def = 30, phy = 84, ovr = 88 },
            new PlayerData { id = "002", number = 2, name = "Bruno Cannon", club = "Real Lombardy", pos = "ST", pac = 76, sho = 89, pas = 60, dri = 72, def = 40, phy = 90, ovr = 85 },
            new PlayerData { id = "003", number = 3, name = "Mateo Ross", club = "Merseyside Red", pos = "CF", pac = 84, sho = 86, pas = 78, dri = 81, def = 44, phy = 75, ovr = 84 },
            new PlayerData { id = "004", number = 4, name = "Luka Iron", club = "Munich United", pos = "ST", pac = 70, sho = 88, pas = 58, dri = 68, def = 45, phy = 88, ovr = 82 },
            new PlayerData { id = "005", number = 5, name = "Jaxson Vane", club = "North London Blue", pos = "ST", pac = 88, sho = 83, pas = 64, dri = 79, def = 32, phy = 77, ovr = 81 },
            new PlayerData { id = "006", number = 6, name = "Karl Hammer", club = "Bavaria FC", pos = "ST", pac = 68, sho = 91, pas = 55, dri = 66, def = 38, phy = 92, ovr = 83 },
            new PlayerData { id = "007", number = 7, name = "Gabriel Thorne", club = "Paris Athletic", pos = "CF", pac = 81, sho = 85, pas = 80, dri = 84, def = 42, phy = 71, ovr = 83 },
            new PlayerData { id = "008", number = 8, name = "Damian Cross", club = "Catalonia City", pos = "ST", pac = 85, sho = 84, pas = 62, dri = 76, def = 35, phy = 80, ovr = 81 },
            new PlayerData { id = "009", number = 9, name = "Giacomo Rossi", club = "Turin Zebras", pos = "ST", pac = 79, sho = 87, pas = 68, dri = 80, def = 31, phy = 74, ovr = 82 },
            new PlayerData { id = "010", number = 10, name = "Hektor Bormann", club = "Ruhr Yellow", pos = "ST", pac = 65, sho = 90, pas = 52, dri = 63, def = 41, phy = 94, ovr = 82 },
            new PlayerData { id = "011", number = 11, name = "Rex Hunter", club = "Manchester Red", pos = "ST", pac = 86, sho = 82, pas = 60, dri = 75, def = 28, phy = 78, ovr = 80 },
            new PlayerData { id = "012", number = 12, name = "Igor Volkov", club = "Eastern Star", pos = "ST", pac = 72, sho = 86, pas = 59, dri = 70, def = 44, phy = 89, ovr = 81 },
            new PlayerData { id = "013", number = 13, name = "Tariq Al-Mansoor", club = "Coastal Riviera", pos = "CF", pac = 87, sho = 81, pas = 75, dri = 85, def = 36, phy = 68, ovr = 82 },
            new PlayerData { id = "014", number = 14, name = "Dario Swift", club = "FC Capital", pos = "RW", pac = 94, sho = 75, pas = 72, dri = 88, def = 38, phy = 62, ovr = 84 },
            new PlayerData { id = "015", number = 15, name = "Jens Van Der Boom", club = "Amsterdam Orange", pos = "LW", pac = 91, sho = 82, pas = 76, dri = 84, def = 42, phy = 69, ovr = 85 },
            new PlayerData { id = "016", number = 16, name = "Santi Blaze", club = "Lisbon Lions", pos = "LW", pac = 93, sho = 79, pas = 70, dri = 86, def = 35, phy = 60, ovr = 83 },
            new PlayerData { id = "017", number = 17, name = "Flynn Flash", club = "London Red", pos = "RW", pac = 96, sho = 71, pas = 68, dri = 85, def = 30, phy = 58, ovr = 82 },
            new PlayerData { id = "018", number = 18, name = "Kenji Sato", club = "Tokyo Express", pos = "LW", pac = 90, sho = 77, pas = 78, dri = 89, def = 40, phy = 61, ovr = 84 },
            new PlayerData { id = "019", number = 19, name = "Zuberi Vance", club = "Cairo Gold", pos = "RW", pac = 92, sho = 76, pas = 73, dri = 82, def = 36, phy = 67, ovr = 82 },
            new PlayerData { id = "020", number = 20, name = "Rafa Spark", club = "Rio Samba", pos = "LW", pac = 89, sho = 80, pas = 74, dri = 86, def = 33, phy = 63, ovr = 82 },
            new PlayerData { id = "021", number = 21, name = "Nico Bolt", club = "Valencia Bats", pos = "RW", pac = 95, sho = 73, pas = 69, dri = 83, def = 31, phy = 59, ovr = 81 },
            new PlayerData { id = "022", number = 22, name = "Milan Petrov", club = "Belgrade Red", pos = "LW", pac = 87, sho = 83, pas = 77, dri = 81, def = 39, phy = 70, ovr = 83 },
            new PlayerData { id = "023", number = 23, name = "Callum Rush", club = "Celtic Green", pos = "RW", pac = 91, sho = 74, pas = 75, dri = 82, def = 41, phy = 65, ovr = 81 },
            new PlayerData { id = "024", number = 24, name = "Elias Dart", club = "Stockholm Blue", pos = "LW", pac = 93, sho = 70, pas = 71, dri = 84, def = 34, phy = 56, ovr = 80 },
            new PlayerData { id = "025", number = 25, name = "Tiago Santos", club = "Porto Eagles", pos = "RW", pac = 88, sho = 78, pas = 79, dri = 88, def = 37, phy = 60, ovr = 83 },

            // VOLUME II: Playmakers & Midfielders (026 - 050)
            new PlayerData { id = "026", number = 26, name = "Leo Lindqvist", club = "Stockholm Blue", pos = "CAM", pac = 78, sho = 80, pas = 91, dri = 86, def = 52, phy = 64, ovr = 87 },
            new PlayerData { id = "027", number = 27, name = "Nico Sterling", club = "Manchester Blue", pos = "CAM", pac = 81, sho = 78, pas = 84, dri = 85, def = 48, phy = 62, ovr = 82 },
            new PlayerData { id = "028", number = 28, name = "Marco Vance", club = "Real Lombardy", pos = "CM", pac = 74, sho = 76, pas = 88, dri = 82, def = 70, phy = 75, ovr = 85 },
            new PlayerData { id = "029", number = 29, name = "Julien Mercer", club = "Paris Athletic", pos = "CAM", pac = 76, sho = 81, pas = 89, dri = 87, def = 45, phy = 60, ovr = 85 },
            new PlayerData { id = "030", number = 30, name = "Diego Maestro", club = "Buenos Aires FC", pos = "CAM", pac = 73, sho = 84, pas = 93, dri = 90, def = 40, phy = 58, ovr = 88 },
            new PlayerData { id = "031", number = 31, name = "Soren Holm", club = "Copenhagen FC", pos = "CM", pac = 72, sho = 75, pas = 87, dri = 80, def = 68, phy = 76, ovr = 82 },
            new PlayerData { id = "032", number = 32, name = "Felix Prophet", club = "North London Blue", pos = "CAM", pac = 80, sho = 79, pas = 86, dri = 85, def = 42, phy = 61, ovr = 82 },
            new PlayerData { id = "033", number = 33, name = "Arthur Pendelton", club = "Yorkshire White", pos = "CM", pac = 69, sho = 72, pas = 88, dri = 81, def = 72, phy = 74, ovr = 83 },
            new PlayerData { id = "034", number = 34, name = "Enzo Vision", club = "FC Capital", pos = "CAM", pac = 77, sho = 77, pas = 90, dri = 88, def = 46, phy = 59, ovr = 84 },
            new PlayerData { id = "035", number = 35, name = "Mateus Silva", club = "Rio Samba", pos = "CM", pac = 75, sho = 74, pas = 85, dri = 83, def = 69, phy = 72, ovr = 81 },
            new PlayerData { id = "036", number = 36, name = "Lukas Loomis", club = "Munich United", pos = "CAM", pac = 82, sho = 76, pas = 83, dri = 84, def = 50, phy = 65, ovr = 81 },
            new PlayerData { id = "037", number = 37, name = "Zander Craft", club = "Brussels Red", pos = "CM", pac = 71, sho = 70, pas = 86, dri = 79, def = 71, phy = 77, ovr = 82 },
            new PlayerData { id = "038", number = 38, name = "Remy Dupont", club = "Marseille Port", pos = "CAM", pac = 79, sho = 82, pas = 87, dri = 86, def = 41, phy = 58, ovr = 83 },
            new PlayerData { id = "039", number = 39, name = "Kofi Sterling", club = "London Red", pos = "RM", pac = 89, sho = 70, pas = 80, dri = 83, def = 55, phy = 71, ovr = 81 },
            new PlayerData { id = "040", number = 40, name = "Davin Cross", club = "Merseyside Blue", pos = "LM", pac = 87, sho = 72, pas = 83, dri = 81, def = 58, phy = 73, ovr = 81 },
            new PlayerData { id = "041", number = 41, name = "Aris Thorne", club = "Athens Shield", pos = "RM", pac = 88, sho = 75, pas = 82, dri = 82, def = 50, phy = 68, ovr = 81 },
            new PlayerData { id = "042", number = 42, name = "Bredan Gale", club = "Dublin Green", pos = "LM", pac = 86, sho = 74, pas = 84, dri = 80, def = 56, phy = 72, ovr = 81 },
            new PlayerData { id = "043", number = 43, name = "Cyril Vance", club = "Catalonia City", pos = "RM", pac = 85, sho = 71, pas = 81, dri = 81, def = 60, phy = 75, ovr = 80 },
            new PlayerData { id = "044", number = 44, name = "Naji Mansoor", club = "Cairo Gold", pos = "LM", pac = 90, sho = 69, pas = 79, dri = 83, def = 48, phy = 64, ovr = 80 },
            new PlayerData { id = "045", number = 45, name = "Eerik Nurmi", club = "Helsinki Ice", pos = "RM", pac = 84, sho = 76, pas = 83, dri = 79, def = 59, phy = 76, ovr = 81 },
            new PlayerData { id = "046", number = 46, name = "Otto Weber", club = "Bavaria FC", pos = "LM", pac = 83, sho = 73, pas = 85, dri = 80, def = 54, phy = 70, ovr = 80 },
            new PlayerData { id = "047", number = 47, name = "Loris Pace", club = "Milan Red", pos = "RM", pac = 91, sho = 68, pas = 78, dri = 84, def = 46, phy = 62, ovr = 80 },
            new PlayerData { id = "048", number = 48, name = "Gael Montero", club = "Madrid Royal", pos = "LM", pac = 86, sho = 77, pas = 82, dri = 85, def = 49, phy = 65, ovr = 82 },
            new PlayerData { id = "049", number = 49, name = "Karel Novak", club = "Prague Iron", pos = "RM", pac = 82, sho = 75, pas = 84, dri = 79, def = 62, phy = 78, ovr = 81 },
            new PlayerData { id = "050", number = 50, name = "Hassan Radi", club = "Riyadh Crown", pos = "LM", pac = 89, sho = 71, pas = 82, dri = 84, def = 51, phy = 66, ovr = 81 },

            // VOLUME III: Anchors & Defenders (051 - 075)
            new PlayerData { id = "051", number = 51, name = "Tobias Kross", club = "Munich United", pos = "CDM", pac = 68, sho = 68, pas = 85, dri = 75, def = 88, phy = 86, ovr = 86 },
            new PlayerData { id = "052", number = 52, name = "Gideon Steel", club = "Manchester Red", pos = "CDM", pac = 71, sho = 60, pas = 79, dri = 72, def = 90, phy = 89, ovr = 85 },
            new PlayerData { id = "053", number = 53, name = "Demetrius Cole", club = "London Red", pos = "CDM", pac = 74, sho = 62, pas = 81, dri = 76, def = 86, phy = 87, ovr = 84 },
            new PlayerData { id = "054", number = 54, name = "Bram Van Dijk", club = "Amsterdam Orange", pos = "CDM", pac = 66, sho = 65, pas = 84, dri = 74, def = 87, phy = 85, ovr = 84 },
            new PlayerData { id = "055", number = 55, name = "Sloan Ironclad", club = "Glasgow Blue", pos = "CDM", pac = 65, sho = 58, pas = 76, dri = 69, def = 89, phy = 91, ovr = 83 },
            new PlayerData { id = "056", number = 56, name = "Sandro Bastoni", club = "Turin Zebras", pos = "CDM", pac = 72, sho = 64, pas = 82, dri = 77, def = 85, phy = 84, ovr = 83 },
            new PlayerData { id = "057", number = 57, name = "Caelan Rock", club = "Yorkshire White", pos = "CDM", pac = 70, sho = 59, pas = 78, dri = 71, def = 87, phy = 88, ovr = 82 },
            new PlayerData { id = "058", number = 58, name = "Lars Lindholm", club = "Oslo Vikings", pos = "CDM", pac = 67, sho = 61, pas = 83, dri = 73, def = 86, phy = 83, ovr = 82 },
            new PlayerData { id = "059", number = 59, name = "Yasin Kaya", club = "Istanbul Eagles", pos = "CDM", pac = 75, sho = 63, pas = 80, dri = 75, def = 84, phy = 82, ovr = 81 },
            new PlayerData { id = "060", number = 60, name = "Ollie Sentinel", club = "Midlands FC", pos = "CDM", pac = 64, sho = 55, pas = 75, dri = 68, def = 88, phy = 90, ovr = 82 },
            new PlayerData { id = "061", number = 61, name = "Rory Mactavish", club = "Celtic Green", pos = "CDM", pac = 69, sho = 66, pas = 81, dri = 72, def = 85, phy = 88, ovr = 82 },
            new PlayerData { id = "062", number = 62, name = "Tito Santos", club = "Lisbon Lions", pos = "CDM", pac = 73, sho = 60, pas = 79, dri = 74, def = 84, phy = 81, ovr = 80 },
            new PlayerData { id = "063", number = 63, name = "Valentin Varga", club = "Budapest FC", pos = "CDM", pac = 68, sho = 58, pas = 82, dri = 70, def = 86, phy = 85, ovr = 81 },
            new PlayerData { id = "064", number = 64, name = "Hector Stone", club = "Madrid Royal", pos = "CB", pac = 65, sho = 40, pas = 60, dri = 55, def = 92, phy = 92, ovr = 87 },
            new PlayerData { id = "065", number = 65, name = "Ray Shield", club = "Merseyside Red", pos = "CB", pac = 72, sho = 35, pas = 64, dri = 60, def = 89, phy = 87, ovr = 85 },
            new PlayerData { id = "066", number = 66, name = "Magnus Fortress", club = "Ruhr Yellow", pos = "CB", pac = 60, sho = 32, pas = 58, dri = 52, def = 94, phy = 95, ovr = 88 },
            new PlayerData { id = "067", number = 67, name = "Klaus Rampart", club = "Bavaria FC", pos = "CB", pac = 68, sho = 38, pas = 66, dri = 58, def = 90, phy = 89, ovr = 85 },
            new PlayerData { id = "068", number = 68, name = "Dante Granite", club = "Turin Zebras", pos = "CB", pac = 70, sho = 42, pas = 62, dri = 61, def = 88, phy = 88, ovr = 84 },
            new PlayerData { id = "069", number = 69, name = "Bruno Bulwark", club = "Milan Red", pos = "CB", pac = 63, sho = 30, pas = 55, dri = 50, def = 91, phy = 93, ovr = 84 },
            new PlayerData { id = "070", number = 70, name = "Nemanja Steel", club = "Belgrade Red", pos = "CB", pac = 66, sho = 36, pas = 63, dri = 56, def = 89, phy = 90, ovr = 84 },
            new PlayerData { id = "071", number = 71, name = "Tariq Tower", club = "Coastal Riviera", pos = "CB", pac = 64, sho = 34, pas = 60, dri = 54, def = 88, phy = 91, ovr = 83 },
            new PlayerData { id = "072", number = 72, name = "Garrick Bastion", club = "North London Blue", pos = "CB", pac = 67, sho = 41, pas = 65, dri = 59, def = 87, phy = 86, ovr = 82 },
            new PlayerData { id = "073", number = 73, name = "Sven Titan", club = "Copenhagen FC", pos = "CB", pac = 61, sho = 28, pas = 56, dri = 48, def = 90, phy = 94, ovr = 83 },
            new PlayerData { id = "074", number = 74, name = "Inigo Guard", club = "Valencia Bats", pos = "CB", pac = 71, sho = 39, pas = 68, dri = 62, def = 86, phy = 84, ovr = 82 },
            new PlayerData { id = "075", number = 75, name = "Viktor Ironhide", club = "Eastern Star", pos = "CB", pac = 62, sho = 31, pas = 57, dri = 51, def = 89, phy = 92, ovr = 82 },

            // VOLUME IV: Fullbacks & Goalkeepers (076 - 100)
            new PlayerData { id = "076", number = 76, name = "Felix Holt", club = "Manchester Blue", pos = "LB", pac = 86, sho = 58, pas = 75, dri = 74, def = 81, phy = 78, ovr = 82 },
            new PlayerData { id = "077", number = 77, name = "Rocco Strider", club = "Real Lombardy", pos = "RB", pac = 89, sho = 55, pas = 74, dri = 76, def = 82, phy = 77, ovr = 82 },
            new PlayerData { id = "078", number = 78, name = "Axel Runner", club = "Bavaria FC", pos = "LB", pac = 91, sho = 52, pas = 72, dri = 78, def = 80, phy = 75, ovr = 82 },
            new PlayerData { id = "079", number = 79, name = "Eugen Surge", club = "Paris Athletic", pos = "RB", pac = 88, sho = 60, pas = 76, dri = 75, def = 83, phy = 80, ovr = 83 },
            new PlayerData { id = "080", number = 80, name = "Javier Glide", club = "Madrid Royal", pos = "LWB", pac = 90, sho = 64, pas = 78, dri = 81, def = 77, phy = 73, ovr = 82 },
            new PlayerData { id = "081", number = 81, name = "Milan Sweep", club = "Belgrade Red", pos = "RWB", pac = 87, sho = 62, pas = 79, dri = 79, def = 81, phy = 76, ovr = 82 },
            new PlayerData { id = "082", number = 82, name = "Caleb Track", club = "Glasgow Blue", pos = "LB", pac = 85, sho = 50, pas = 71, dri = 72, def = 83, phy = 82, ovr = 81 },
            new PlayerData { id = "083", number = 83, name = "Giacomo Wing", club = "Turin Zebras", pos = "RB", pac = 86, sho = 54, pas = 73, dri = 74, def = 82, phy = 78, ovr = 81 },
            new PlayerData { id = "084", number = 84, name = "Niels Overlap", club = "Amsterdam Orange", pos = "LWB", pac = 88, sho = 63, pas = 77, dri = 80, def = 76, phy = 74, ovr = 81 },
            new PlayerData { id = "085", number = 85, name = "Benoit Side", club = "Marseille Port", pos = "RWB", pac = 87, sho = 59, pas = 75, dri = 77, def = 78, phy = 75, ovr = 80 },
            new PlayerData { id = "086", number = 86, name = "Dillon Boundary", club = "Midlands FC", pos = "LB", pac = 84, sho = 48, pas = 70, dri = 71, def = 84, phy = 81, ovr = 80 },
            new PlayerData { id = "087", number = 87, name = "Soren Edge", club = "Copenhagen FC", pos = "RB", pac = 85, sho = 52, pas = 72, dri = 73, def = 83, phy = 80, ovr = 80 },
            new PlayerData { id = "088", number = 88, name = "Tomas Line", club = "Lisbon Lions", pos = "LB", pac = 86, sho = 51, pas = 71, dri = 72, def = 82, phy = 79, ovr = 80 },
            new PlayerData { id = "089", number = 89, name = "Oscar \"The Wall\" Ward", club = "London Red", pos = "GK", pac = 52, sho = 30, pas = 70, dri = 55, def = 86, phy = 85, ovr = 88 },
            new PlayerData { id = "090", number = 90, name = "Gunnar Vault", club = "Bavaria FC", pos = "GK", pac = 48, sho = 30, pas = 74, dri = 50, def = 89, phy = 88, ovr = 87 },
            new PlayerData { id = "091", number = 91, name = "Igor Sentry", club = "Eastern Star", pos = "GK", pac = 50, sho = 30, pas = 68, dri = 52, def = 85, phy = 84, ovr = 85 },
            new PlayerData { id = "092", number = 92, name = "Eoin Keeper", club = "Dublin Green", pos = "GK", pac = 55, sho = 30, pas = 80, dri = 56, def = 83, phy = 82, ovr = 84 },
            new PlayerData { id = "093", number = 93, name = "Mateo Block", club = "Buenos Aires FC", pos = "GK", pac = 53, sho = 30, pas = 65, dri = 50, def = 82, phy = 80, ovr = 84 },
            new PlayerData { id = "094", number = 94, name = "Klaus Shielding", club = "Munich United", pos = "GK", pac = 45, sho = 30, pas = 72, dri = 50, def = 87, phy = 86, ovr = 84 },
            new PlayerData { id = "095", number = 95, name = "Darius Reflex", club = "Rio Samba", pos = "GK", pac = 58, sho = 30, pas = 67, dri = 54, def = 80, phy = 79, ovr = 83 },
            new PlayerData { id = "096", number = 96, name = "Tobias Glove", club = "Stockholm Blue", pos = "GK", pac = 46, sho = 30, pas = 71, dri = 50, def = 84, phy = 85, ovr = 83 },
            new PlayerData { id = "097", number = 97, name = "Santi Reach", club = "Porto Eagles", pos = "GK", pac = 51, sho = 30, pas = 69, dri = 52, def = 81, phy = 81, ovr = 82 },
            new PlayerData { id = "098", number = 98, name = "Luka Stop", club = "Prague Iron", pos = "GK", pac = 47, sho = 30, pas = 73, dri = 50, def = 84, phy = 83, ovr = 81 },
            new PlayerData { id = "099", number = 99, name = "Hugo Palmer", club = "Paris Athletic", pos = "GK", pac = 50, sho = 30, pas = 76, dri = 52, def = 80, phy = 80, ovr = 81 },
            new PlayerData { id = "100", number = 100, name = "Yannick Barrier", club = "Brussels Red", pos = "GK", pac = 49, sho = 30, pas = 68, dri = 50, def = 83, phy = 82, ovr = 81 }
        };
    }
}
