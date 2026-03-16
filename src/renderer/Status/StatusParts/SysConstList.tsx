/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: SysConstList.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


export const sysconstlist : Record<string, string[]> = {
    "ICRS" : ["RA", "Dec", "J","ICRS"],
    "FK5" : ["RA", "Dec", "J","FK5"],
    "FK4" : ["RA", "Dec", "B","FK4"],
    "Gal" : ["Long","Lat","J","Galactic"],
    "Topo" : ["Az","Alt","","Topocentric"],
    "Obs" : ["Az","Alt","","Observed"],
    "Phys" : ["Az","Alt","","Physical"],
    "Mount" : ["Az","Alt","","Mount"],
    "Unknown" : ["RA","Dec","","Unknown"],
    "NoCSys" : ["","","","NoCSys"],
    "Inst" : ["Az","Alt","","Instrument"],
    "GImage" : ["Az","Alt","","GImage"],
    "None" : ["","","","NoCSys"],
}