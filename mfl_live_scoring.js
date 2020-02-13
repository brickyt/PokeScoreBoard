
var ls_stats = [];
var ls_tstats = [];
var last_stats_request = 0;
var ls_showing = [];
var ls_rkeys = [ 'S', 'NS', 'IR', 'TS' ];
var ls_rkey_labels = { 'S'  : 'Starters', 
                       'NS' : 'Reserves',
                       'IR' : 'Injured Reserve',
                       'TS' : 'Taxi Squad',
                       'R'  : 'Players'
};
var ls_fran_totals = [];
var ls_update_all = 1;
var ls_last_update = "";
var ls_last_update_secs = 0;
var ls_do_avg = 0;
var ls_avg_field = "";
var ls_explain = "";
var ls_should_hide_gs = false;
var ls_should_hide_ps = false;
var ls_should_hide_rs = false;
var ls_should_hide_ts = false;
var hilite_fields = [];
var show_math = [];
var pid_str;
var ls_timeout = 40000;

var ls_ticker_speed = 800;
var ls_ticker_data = []
var ls_ticker_text = [];
var ls_ticker_index = 0;
var ls_curr_str = "";
var ls_ticker_lp = 0;
var ls_ticker_rp = 0;
var ls_ticker_max = 0;
var ls_table_elem;
var ls_label_elem;
var ls_div_elem;


function LSPlayer (id, name, pos, nfl_team, lpos) {
    this.id = id;
    this.name = name.replace(/ /g,'&nbsp;');
    this.pos = pos;
    this.nfl_team = nfl_team;
    this.lpos = lpos;
}

function pad_player_id (pid) {
    if(typeof pid == 'number') {
        pstr = pid.toString();
    }
    else {
        pstr = pid;
    }
    if(pstr.length <= 4) {
        pstr = "0000" + pstr;
        return pstr.slice(-4);
    }
    return pstr;
}

function load_elem (id, value) {
    var elem = document.getElementById(id);
    if (elem) {
        elem.innerHTML = value;
    }
}

function highlight (elem) {
    if(ls_update_all == 0) {
        addClass(elem, "ls_changed");
        hilite_fields.push(elem);
    }
}

function update_elem (elem, value, check) {
    if(elem) {
        if(check > 0) {
            var old_val = elem.innerHTML;
            if(old_val == undefined || old_val == value) {
                return;
            }
        }
        elem.innerHTML = value;
        highlight(elem);
    }
}

function update_field (id, value, check) {
    var elem = document.getElementById(id);
    if(elem) {
        update_elem(elem, value, check);
    }
}

function update_field_by_class (classid, value, check) {
    var ellist = document.getElementsByClassName(classid);
    for (var i = 0; i < ellist.length; i++) {
        if(ellist[i]) {
            update_elem(ellist[i], value, check);
        }
    }
}

function update_class_by_class (classid, new_class) {
    var ellist = document.getElementsByClassName(classid);
    for (var i = 0; i < ellist.length; i++) {
        if(ellist[i]) {
            if(new_class != "ls_redzone") {
                removeClass(ellist[i], "ls_redzone");
            }
            if(new_class != "ls_withposs") {
                removeClass(ellist[i], "ls_withposs");
            }
            if(new_class != "ls_noposs") {
                removeClass(ellist[i], "ls_noposs");
            }
            if(new_class != undefined && new_class != "") {
                addClass(ellist[i], new_class);
            }
        }
    }
}

function hide_by_class (classid, hide, toshow) {
    var ellist = document.getElementsByClassName(classid);
    if(toshow == undefined || toshow == "") {
        toshow = 'table-row';
    }
    for (var i = 0; i < ellist.length; i++) {
        if(ellist[i]) {
            if(hide) {
                ellist[i].style.display = 'none';
            }
            else {
                ellist[i].style.display = toshow;
            }
        }
    }
}

function hide_by_id (elem_id, hide, toshow) {
    var elem = document.getElementById(elem_id);
    if(elem) {
        if(hide) {
            elem.style.display = 'none';
        }
        else {
            elem.style.display = toshow;
        }
    }
}

function clear_highlights () {
    for (var i = 0; i < hilite_fields.length; i++) {
        removeClass(hilite_fields[i], "ls_changed");
    }
    hilite_fields = [];
}

function set_border (elem, onoff) {
    if(onoff) {
        addClass(elem, "ls_og_selected");
    }
    else {
        removeClass(elem, "ls_og_selected");
    }
}

function format_time_rem (secs) {
    var minstr = Math.floor(secs/60).toFixed(0);
    var secstr = (secs % 60).toString();
    if(secstr.length < 2) {
        secstr = ("00" + secstr).slice(-2);
    }
    return minstr + ":" + secstr;
}

function reset_ls_timer () {
    if(ls_timeout > 0) {
        setTimeout(request_stats, ls_timeout);
    }
}

function reset_ticker_timer () {
    setTimeout(update_ticker, ls_ticker_speed);
    ls_ticker = 2;
}

function request_stats () {
    var now;
    if(!Date.now) {
        now = new Date().getTime();
    }
    else {
        now = Date.now();
    }
    var week = (liveScoringWeek < 10) ? "0" + liveScoringWeek : liveScoringWeek;
    if((now - last_stats_request) > ls_timeout) {
        var xhttp = new XMLHttpRequest();
        var url = xmlBaseURL + 'live_stats_';
        if(ls_uses_idps) {
            url = url + "idp_";
        }
        url = url + week + '.txt?RANDOM=' + now;
        xhttp.onreadystatechange = function() { if(this.readyState == 4 && this.status == 200) { parseLiveStats(this.responseText, now); } };
        xhttp.open("GET", url, true);
        xhttp.send();
        last_stats_request = now;
    }
    reset_ls_timer();
}

function parseLiveStats (resp, time)  {
    ls_stats = [];
    ls_tstats = [];
    var lines = resp.split("\n");
    for (var i in lines) {
        var fields = lines[i].split("|");
        if(fields[0] == 'DATE') {
            ls_last_update_secs = fields[1];
            ls_last_update = fields[2];
        }
        else if(fields[0] == 'REFRESH') {
            if(fields[1] != ls_timeout) {
                ls_timeout = fields[1];
                reset_ls_timer();
            }
        }
        else if(fields[0] == 'TICKER') {
            if(ls_ticker) {
                for (j = 1; j < fields.length; j++) {
                    var item = fields[j].split(";");
                    if(item[0] > ls_ticker_max) {
                        ls_ticker_max = item[0];
                        ls_ticker_data[ls_ticker_index] = item[1];
                        ls_ticker_index++;
                    }
                }
                while(ls_ticker_index > 15) {
                    ls_ticker_data.shift();
                    ls_ticker_index--;
                }
                //console.log("PS: ls_ticker_index: " + ls_ticker_index);

                if(ls_ticker == 1) {
                    reset_ticker_timer();   // only call once
                }
            }
        }
        else if(!isNaN(fields[0])) {
            // is a position player
            if(typeof ls_stats[fields[0]] === 'undefined') {
                ls_stats[fields[0]] = {};
            }
            for (j = 1; j < fields.length; j++) {
                var onestat = fields[j].split(" ");
                ls_stats[fields[0]][onestat[0]] = onestat[1];
            }
        }
        else {
            // is a team stat
            if(typeof ls_tstats[fields[0]] === 'undefined') {
                ls_tstats[fields[0]] = {};
            }
            for (j = 1; j < fields.length; j++) {
                var onestat = fields[j].split(" ");
                ls_tstats[fields[0]][onestat[0]] = onestat[1];
            }
        }
    }
    update_scores();
    update_field("last_update", ls_last_update, 1);
}

function ls_get_points (stat,val,lower,upper,form,bonus) {
    var points = 0;
    if(ls_list_cats[stat] ||  /,/.test(val)) {
        if(val != undefined) {
            var vals = val.split(",");
            for (var i in vals) {
                points += ls_get_points2(stat, vals[i], lower, upper, form, bonus);
            }
        }
    }
    else {
        points = ls_get_points2(stat, val, lower, upper, form, bonus);
    }
    return points;
}

function ls_get_points2 (stat,val,lower,upper,form,bonus) {
    var points = 0;
    if(val == undefined) {
        return 0;
    }
    var nval = Number(val);
    var nlower = Number(lower);
    var nupper = Number(upper);
    var match = 0;
    if(/^[A-Z]/.test(val)) {
        if(nval == lower) {
            match = 1;
        }
    }
    else {
        if(!/&/.test(val)) {
            if(nval >= nlower && nval <= nupper) {
                match = 1;
            }
        }
        else {
            var comp = val.split("&");
            var comp1 = Number(comp[0]);
            var comp2 = Number(comp[1]);
            if(comp1 >= nlower && comp1 <= nupper &&
               comp2 >= nlower && comp2 <= nupper) {
                match = 1;
            }
        }
    }
    if(match == 1) {
        if(/^\*/.test(form)) {
            points = nval * Number(form.substr(1));
        }
        else if(/\//.test(form)) {
            var parts = form.split("/");
            var ppu = parts[0];
            var unit = parts[1];
            if(unit == "" || unit == undefined) { unit = 1; }
            var nppu = Number(ppu);
            var nunit = Number(unit);
            if(nunit == 0) { nunit = 1; }
            var hasdot = /\./;
            if(!hasdot.test(unit) && !hasdot.test(ppu)) {
                // both unit and mult are integers, use integer math
                if(bonus != undefined && bonus != "" && !/\//.test(stat)) {
                    points = ((nval - nlower) / nunit) | 0;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                    points += (Number(bonus)) | 0;
                }
                else {
                    points = (nval/nunit) | 0;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                }
            }
            else if(!hasdot.test(unit) && hasdot.test(ppu)) {
                // unit is integer, mult isn't, use partial integer math
                if(bonus != undefined && bonus != "" && !/\//.test(stat)) {
                    points = ((nval - nlower) / nunit) | 0;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                    points += Number(bonus);
                }
                else {
                    points = (nval/nunit) | 0;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                }
            }
            else {
                // both aren't integers
                if(bonus != undefined && bonus != "" && !/\//.test(stat)) {
                    points = (nval - nlower) / nunit;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                    points += Number(bonus);
                }
                else {
                    points = nval/nunit;
                    if(ppu != "" && !isNaN(nppu) && nppu != 0) {
                        points *= nppu;
                    }
                }
            }
        }
        else {
            points = Number(form);
        }
    }
    if(points != 0) {
        ls_explain = ls_explain + stat + "," + nval + "," + format_points(points) + "|";
    }
    return points;
}

function update_player_points (pid) {
    var pos = ls_player[pid].pos;
    var nfl_team = ls_player[pid].nfl_team;
    show_math[pid] = "";
    if(/^FA/.test(nfl_team) || nfl_team == undefined || nfl_team == "") {
    }
    else if(ls_nfl_games[nfl_team] == undefined) {
    }
    else if(ls_nfl_games[nfl_team].status == "INPROG" ||
            ls_nfl_games[nfl_team].status == "OVER") {
        var points = 0;
        if(ls_team_pos[pos] == 1 && ls_tstats[nfl_team] != undefined) {
            points = score_player(nfl_team,pos);
        }
        else if(ls_team_pos[pos] == 0 && ls_stats[pid] != undefined) {
            points = score_player(pid,pos);
        }
        //console.log(pid + " " + show_math[pid]);
        ls_player[pid].points = points;
    }
    return ls_player[pid].points;
}

function ls_explain_points (pid) {
    var str = "";
    var pos = ls_player[pid].pos;
    ls_explain = "";
    if(ls_team_pos[pos] == 1) {
        var nfl_team = ls_player[pid].nfl_team;
        if(ls_tstats[nfl_team] != undefined) {
            points = score_player(nfl_team,pos);
        }
    }
    else if(ls_team_pos[pos] == 0 && ls_stats[pid] != undefined) {
        points = score_player(pid,pos);
    }
    if(ls_explain != "") {
        var stats = ls_explain.split("|");
        for (i = 0; i < stats.length; i++) {
            if(stats[i] != "") {
                var fields = stats[i].split(",");
                str = str + "* " + fields[2] + " points for " + fields[1] + " ";
                if(ls_cat_desc[fields[0]] != undefined) {
                    str = str + ls_cat_desc[fields[0]];
                }
                else {
                    str = str + fields[0];
                }
                str = str + "\n";
            }
        }
    }
    if(str) {
        alert(str);
    }
    else {
        alert("No stats");
    }
}

function update_scores () {

    var ls_reorder = 0;
    for (var team in ls_nfl_games) {
        update_game_status(team);
    }

    for (var pid in ls_player) {
        update_player_points(pid);
    }

    var all_total = 0;
    var fcount = 0;
    for (var fid in ls_fran_totals) {
        var rkeys;
        var show_field = 0;
        var which;
        ls_fran_totals[fid].pmr = 0;
        ls_fran_totals[fid].playing = 0;
        ls_fran_totals[fid].ytp = 0;
        ls_fran_totals[fid].fin = "";
        if(ls_showing['away'] == fid) {
            rkeys = ls_rkeys;
            show_field = 1;
            which = "away";
        } 
        else if(ls_showing['home'] == fid) {
            rkeys = ls_rkeys;
            show_field = 1;
            which = "home";
        }
        else if(ls_addns > 0) {
            rkeys = [ 'S', 'NS' ];
        }
        else {
            rkeys = [ 'S' ];
        }
        if(ls_best_lineup) {
            var prev_bl = ls_fran_totals[fid]["best_lineup"];
            get_best_lineup(fid);
            if(ls_fran_totals[fid]["best_lineup"] != prev_bl && show_field) {
                build_one_team(which, fid);
            }
        }
        ls_fran_totals[fid].old_total = ls_fran_totals[fid].total;
        for (var i in rkeys) {
            var rk = rkeys[i];
            var total = 0;
            for (var j in ls_rosters[fid][rk]) {
                var pid = ls_rosters[fid][rk][j];
                var pos = ls_player[pid].pos;
                var nfl_team = ls_player[pid].nfl_team;
                if(/^FA/.test(nfl_team)) {
                }
                else if(ls_nfl_games[nfl_team].status == "INPROG" ||
                        ls_nfl_games[nfl_team].status == "OVER") {
                    total += ls_player[pid].points;
                    if(show_field == 1) {
                        update_field_by_class("pfpts_" + pid,
                                     format_points(ls_player[pid].points), 1);
                        if(ls_team_pos[pos] == 1 && ls_def_pos[pos] == 1) {
                            ls_player[pid].stats_str = get_tstats_str(nfl_team);
                        }
                        else if(ls_team_pos[pos] == 1 && ls_def_pos[pos] != 1) {
                            ls_player[pid].stats_str = get_otstats_str(nfl_team);
                        }
                        else {
                            ls_player[pid].stats_str = get_stats_str(pid);
                        }
                        if(ls_player[pid].stats_str != undefined) {
                            update_field_by_class("stats_" + pid,
                                                  ls_player[pid].stats_str, 1);
                        }
                    }
                    if(rk == 'S') {
                        if (ls_nfl_games[nfl_team].status == 'INPROG') {
                            ls_fran_totals[fid].playing += 1;
                            ls_fran_totals[fid].pmr +=
                                         ls_nfl_games[nfl_team].secs_left;
                        }
                    }
                }
                else if (ls_nfl_games[nfl_team].status == 'SCHED') {
                    if(rk == 'S') {
                        ls_fran_totals[fid].ytp += 1;
                        ls_fran_totals[fid].pmr += 3600;
                    }
                }
            }

            if(rk == 'S') {
                ls_fran_totals[fid].total = total;
            }
            else if(rk == 'NS') {
                ls_fran_totals[fid].nstotal = total;
            }
        }

        // Add the adjustments
        if(ls_addns > 0) {
            var adj = ls_fran_totals[fid].nstotal*ls_addns;
            if(ls_adjust[fid] == undefined) {
                ls_adjust[fid] = {label: "Non-starter adjustment",
                                  value: adj };
            }
            else {
                ls_adjust[fid].value = adj;
            }
        }
        if(ls_adjust[fid] != undefined) {
            ls_fran_totals[fid].total += ls_adjust[fid].value;
        }
        if(ls_hfa[fid] != undefined) {
            ls_fran_totals[fid].total += ls_hfa[fid];
        }
        if(ls_vert_og &&
           ls_fran_totals[fid].total != ls_fran_totals[fid].old_total) {
            ls_reorder = 1;
        }

        // Add hidden players
        if(ls_rosters[fid].H != undefined) {
            ls_fran_totals[fid].ytp += ls_rosters[fid].H;
            ls_fran_totals[fid].pmr += 3600*ls_rosters[fid].H;
        }
        if(!ls_best_lineup && ls_fran_totals[fid].pmr == 0 &&
           ls_fran_totals[fid].playing == 0) {
            ls_fran_totals[fid].fin = ls_vert_og ? "&nbsp;(F)" : "F";
        }
        else if(ls_vert_og) {
            ls_fran_totals[fid].fin = "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        if(show_field) {
            update_field("ffpts_" + which, format_points(ls_fran_totals[fid].total), 1);
            update_field("fspts_" + fid, format_points(ls_fran_totals[fid].total), 1);
            update_field("frpts_" + fid, format_points(ls_fran_totals[fid].nstotal), 1);
            update_field("playing_" + which, ls_fran_totals[fid].playing, 1);
            update_field("ytp_" + which, ls_fran_totals[fid].ytp,1);
            update_field("pmr_" + which, format_time_rem(ls_fran_totals[fid].pmr),1);
            //update_field("proj_" + ha, ls_fran_totals[fid].proj);
        }
    }
    if(ls_reorder) {
        build_other_games();
    }
    for (var fid in ls_fran_totals) {
        var fin = ls_fran_totals[fid].fin + "&nbsp;";
        update_field_by_class("oggstat_" + fid, fin, 1);
        update_field_by_class("ogffpts_" + fid, format_points(ls_fran_totals[fid].total), 1);
        all_total += ls_fran_totals[fid].total;
        fcount++;
    }
    if(ls_do_avg && fcount > 0) {
        var avg = format_points(all_total/fcount);
        update_field_by_class("ogffpts_avg", avg, 1);
        if(ls_avg_field) {
            update_field(ls_avg_field, avg);
        }
    }
    ls_update_all = 0;
    setTimeout(clear_highlights, 10000);
}

function update_game_status (team) {
    var opp = ls_nfl_games[team].opp;
    var game_status = '<a target="new" href="pro_matchup?L=' + league_id + '&amp;W=' + liveScoringWeek + '&amp;MATCHUP=';
    var poss_class = "";
    if(ls_nfl_games[team].time == 0) {
        game_status = "BYE";
        ls_nfl_games[team].secs_left = 0;
        ls_nfl_games[team].status = "BYE";
    }
    else if (ls_nfl_games[team].time > ls_last_update_secs) {
        if(ls_nfl_games[team].where == 'away') {
            game_status = game_status + team + '%2C' + opp + '">' +
                                        team + "&nbsp;@&nbsp;" + opp;
        }
        else {
            game_status = game_status + opp + '%2C' + team + '">' +
                                        team + "&nbsp;v&nbsp;" + opp;
        }
        game_status = game_status + "</a><br>" + ls_nfl_games[team].pretty_time;
        ls_nfl_games[team].secs_left = 3600;
        ls_nfl_games[team].status = "SCHED";
    }
    else if(ls_tstats[team] == undefined) {
        console.log("team stats for " + team + " is undefined");
        return;
    }
    else if(ls_tstats[opp] == undefined) {
        console.log("team stats for " + opp + " is undefined");
        return;
    }
    else {
        if(ls_tstats[team].TPS == undefined) {
            ls_tstats[team].TPS = 0;
        }
        if(ls_tstats[opp].TPS == undefined) {
            ls_tstats[opp].TPS = 0;
        }
        if(ls_nfl_games[team].where == 'away') {
            game_status = game_status + team + '%2C' + opp + '">' +
                          team + "&nbsp;" + ls_tstats[team].TPS + "&nbsp;@&nbsp;" + opp + "&nbsp;" + ls_tstats[opp].TPS;
        }
        else {
            game_status = game_status + opp + '%2C' + team + '">' +
                          team + "&nbsp;" + ls_tstats[team].TPS + "&nbsp;v&nbsp;" + opp + "&nbsp;" + ls_tstats[opp].TPS;
        }
        game_status = game_status + "</a><br>";
        if(ls_tstats[team].QUARTER == '' || ls_tstats[team].QUARTER == 'F') {
            ls_nfl_games[team].secs_left = 0;
            ls_nfl_games[team].status = "OVER";
            game_status = game_status + "Final";
        }
        else {
            poss_class = "ls_noposs";
            var when;
            ls_nfl_games[team].status = "INPROG";
            var parts = ls_tstats[team].REMAINING.split(":");
            ls_nfl_games[team].secs_left = parts[0]*60 + Number(parts[1]);
            if(ls_tstats[team].QUARTER == 'O' || ls_tstats[team].QUARTER > 4) {
                when = "OT";
            }
            else if(ls_tstats[team].QUARTER == 'H') {
                when = "H";
                ls_nfl_games[team].secs_left += 15*60*2;
            }
            else {
                ls_nfl_games[team].secs_left += 15*60*(4-ls_tstats[team].QUARTER);
                when = ls_tstats[team].QUARTER + "Q";
            }
            when = when + "&nbsp;" + ls_tstats[team].REMAINING;
        
            var down = ls_tstats[team].DOWN;
            if(down === undefined || down == 0) {
                down = 1;
            }
            if(down == 1) {
                down = down + "st";
            }
            else if(down == 2) {
                down = down + "nd";
            }
            else if(down == 3) {
                down = down + "rd";
            }
            else if(down == 4) {
                down = down + "th";
            }
            game_status = game_status + when;
            if(ls_tstats[team].YARDLINE != undefined &&
               ls_tstats[team].YARDLINE != "") {
                var fieldpos = ls_tstats[team].YARDLINE.split(":");
                var side = fieldpos[0];
                var yardline = Number(fieldpos[1]);
                if(side == '50') {
                    side = "";
                    yardline = 50;
                }
                if(ls_tstats[team].TOGO != undefined && ls_tstats[team].TOGO != "") {
                    var downdist = down + "&nbsp;and&nbsp;" + ls_tstats[team].TOGO + " at " + side + "&nbsp;" + yardline;
                    game_status = game_status + "<br>" + downdist;

                    if(ls_tstats[team].POSSESSION > 0) {
                        poss_class = "ls_withposs";
                //console.log(team + " poss=" + ls_tstats[team].POSSESSION + " yard=" + ls_tstats[team].YARDLINE + " " + side + " " + yardline);
                        if(side != team && yardline < 20) {
                            poss_class = "ls_redzone";
                        }
                    }
                }
            }
        }
    }
    ls_nfl_games[team]["game_status"] = game_status;
    update_field_by_class("game_" + team, game_status, 1);
    update_class_by_class("game_" + team, poss_class);
}

function update_ticker () {
    if(ls_ticker) {
        var prev_ticker = ls_div_elem.innerHTML;
        var table_w = ls_table_elem.offsetWidth;
        var label_w = ls_label_elem.offsetWidth;
        var max_div_w = table_w - label_w - 35;
        var divw = ls_div_elem.offsetWidth;
        var pcl = divw/ls_curr_str.length;
        divw += 3*pcl;
        //console.log("Updating ticker max=" + max_div_w + " divw=" + divw + " lp=" + ls_ticker_lp + " rp=" + ls_ticker_rp + " pcl=" + pcl);
        if(divw >= max_div_w && ls_curr_str.length > 30) {
            var count = 3;
            do {
                ls_curr_str = ls_curr_str.substr(count);
                ls_div_elem.innerHTML = ls_curr_str;
                count = 1;
                divw = ls_div_elem.offsetWidth;
            } while(divw >= max_div_w && ls_curr_str.length > 30);
        }
        if(ls_ticker_rp - ls_ticker_lp < 10 && ls_ticker_index > 0 ) {
            var next_item = " ... " + ls_ticker_data.shift() + "  ";
            ls_ticker_index--;
            var chars = next_item.split("");
            for (var j = 0; j <= chars.length-3; j += 3) {
                ls_ticker_text[ls_ticker_rp++] = chars[j] + chars[j+1] +
                                                 chars[j+2];
            }
        }
        if(ls_ticker_lp < ls_ticker_rp) {
            ls_curr_str = ls_curr_str + ls_ticker_text[ls_ticker_lp++];
        }
        ls_div_elem.innerHTML = ls_curr_str;
        if(ls_ticker_lp > 1000) {
            //console.log("Garbage collection at " + ls_ticker_lp);
            for (var i = 0; i < ls_ticker_lp-1000; i++) {
                ls_ticker_text[i] = ls_ticker_text[i+1000];
            }
            ls_ticker_lp -= 1000;
            ls_ticker_rp -= 1000;
        }
        if(ls_curr_str != prev_ticker) {
            reset_ticker_timer();
        }
        else {
            ls_ticker = 1;
        }
    }
}

function init_marquee (which, fid) {
    var fidkey = "fid_" + fid;
    var icon = "";
    if(fid == 'BYE' || fid == 'AVG') {
        if(fid == 'BYE') {
            load_elem("fname_" + which, "BYE");
            update_field("ffpts_" + which, "&nbsp;");
        }
        else {
            load_elem("fname_" + which, "Average");
            ls_avg_field = "ffpts_" + which;
            ls_do_avg = 1;
            update_field(ls_avg_field, "&nbsp;");
        }
        load_elem("ficon_" + which, "&nbsp;");
        update_field("playing_" + which, "&nbsp;");
        update_field("ytp_" + which, "&nbsp;");
        update_field("pmr_" + which, "&nbsp;");
    }
    else if(franchiseDatabase[fidkey].icon != undefined) {
        if(franchiseDatabase[fidkey].icon.length > 1) {
            icon = '<img src="' + franchiseDatabase[fidkey].icon + 
                   '" ' + ls_icon_dim + ' id="franchiseicon_' + fid + 
                   '" class="franchiseicon" />';
        }
        load_elem("ficon_" + which, icon);
        load_elem("fname_" + which, franchiseDatabase[fidkey].name);
        update_field("ffpts_" + which, format_points(ls_fran_totals[fid].total));
        update_field("playing_" + which, ls_fran_totals[fid].playing);
        update_field("ytp_" + which, ls_fran_totals[fid].ytp);
        update_field("pmr_" + which, format_time_rem(ls_fran_totals[fid].pmr));
        //update_field("proj_" + which, ls_fran_totals[fid].proj);
    }
}

function build_other_games (home,away) {
    var html;
    var game_ord = [];
    for (var i = 0; i < ls_games.length; i++) {
        game_ord[i] = i;
    }
    if(ls_vert_og) {
        // sort the teams by points scored
        game_ord.sort(function(a,b) {
            var afid = ls_games[a];
            var bfid = ls_games[b];
            var apts = ls_fran_totals[afid] == undefined ? 0 : ls_fran_totals[afid].total;
            var bpts = ls_fran_totals[bfid] == undefined ? 0 : ls_fran_totals[bfid].total;
            if(apts < bpts) { return 1; }
            else if(apts > bpts) { return -1; }
            else { return 0; }
        });
        html = '<tr><th>Weekly Points Standings</th></tr><tr><td align="left">\n';
    }
    else {
        html = "<tr><td>\n";
    }
    for (var gid = 0; gid < game_ord.length; gid++) {
        var i = game_ord[gid];
        var game = [];
        if(/,/.test(ls_games[i])) {
            game = ls_games[i].split(",");
        }
        else {
            game[0] = '';
            game[1] = ls_games[i];
        }
        var link = "switch_game('" + game[1] + "','" + game[0] + "');";
        html = html + '<div id="og_' + i + '" class="ls_other_game" onclick="' + link + '" onmouseenter="set_border(this,1);" onmouseleave="set_border(this,0);" style="display:inline-block;"><table border="0" cellspacing="0" cellpadding="0">\n';
        for (var j = 0; j < 2; j++) {
            if(game[j] == '') {
            }
            else if(game[j] == 'BYE') {
                html = html + '<tr><td class="ls_og_cell">BYE</td><td style="border:none;"><div>&nbsp;</div></td><td style="border:none;"><div>&nbsp;</div></td></tr>\n';
            }
            else if(game[j] == 'AVG') {
                ls_do_avg = 1;
                html = html + '<tr><td class="ls_og_cell">AVG</td><td align="right" style="border:none;"><div class="ogffpts_avg">0</div></td><td style="border:none;"><div>&nbsp;</div></td></tr>\n';
            }
            else {
                var fidkey = "fid_" + game[j];
                html = html + '<tr><td class="ls_og_cell">' + franchiseDatabase[fidkey].abbrev + '</a></td><td align="right" style="border:none;"><div class="ogffpts_' + game[j] + '">';
                html = html + format_points(ls_fran_totals[game[j]].total);
                html = html + '</div></td><td style="border:none;"><div class="oggstat_' + game[j] + '">';
                html = html + ls_fran_totals[game[j]].fin + "&nbsp;";
                html = html + '</div></td></tr>\n';
            }
        }
        html = html + "</table></div>\n";
        if(ls_vert_og) {
            html = html + "<br>";
        }
    }
    html = html + '</td>';
    if(ls_vert_og) {
        html = html + '<td style="border:none;">&nbsp;</td>';
    }
    html = html + '</tr>\n';
    load_elem("other_games", html);
}

function build_one_team (which,fid) {
    var html = "";

    ls_showing[which] = fid;
    if(fid != 'BYE' && fid != 'AVG') {
      for (var i in ls_rkeys) {
        var rk = ls_rkeys[i];
        var last_pos = "";
        if((typeof ls_rosters[fid][rk] != 'undefined') &&
           (ls_rosters[fid][rk].length > 0)) {
            var rowclass = "ls_" + (rk == 'S' ? 'starters' : 'nonstarters');
            html = html + '<tr class="' + rowclass + '"><th>' + ls_rkey_labels[rk] + '</th><th class="ls_game_info">Game</th><th class="ls_player_stats">Stats</th><th>Points</th>\n';
            var rowcnt = 0;
            for (var j in ls_rosters[fid][rk]) {
                var rowstyle = (rowcnt % 2) ? "oddtablerow" : "eventablerow"
                rowstyle = rowstyle + " " + rowclass;
                var pid = ls_rosters[fid][rk][j];
                //var padpid = pad_player_id(pid);
                var nfl_team = ls_player[pid].nfl_team;
                if(/^FA/.test(nfl_team)) {
                    pgame = "";
                }
                else {
                    if(ls_def_pos[ls_player[pid].pos] && 
                       ls_nfl_games[nfl_team].opp != "BYE") {
                        nfl_team = ls_nfl_games[nfl_team].opp;
                    }
                    pgame = ls_nfl_games[nfl_team]["game_status"];
                }
                if(j > 0 && ls_player[pid].pos != last_pos) {
                    rowstyle = rowstyle + " newposition";
                }
                last_pos = ls_player[pid].pos;
                var ppts =  format_points((ls_player[pid].points == undefined)
                                           ? 0 : ls_player[pid].points);
                var pstats = ls_player[pid].stats_str == undefined ? "" :
                                                    ls_player[pid].stats_str;
                var link = "player?L=" + league_id + "&P=" + pid;
                html = html + '<tr class="' + rowstyle + '"><td><a href="' + link + '" target="new" class="reallysmall">' + ls_player[pid].name + '</a><br>' + ls_player[pid].nfl_team + ' ' + ls_player[pid].pos + '</td>';
                html = html + '<td class="ls_game_info"><div class="game_' + nfl_team + ' reallysmall">' + pgame + '</div></td>';
                html = html + '<td class="ls_player_stats"><div class="stats_' + pid + ' reallysmall">' + pstats + '</div></td>'; 
                var exp_link = "ls_explain_points('" + pid + "');";
                html = html + '<td align="right"><div onclick="' + exp_link +'" class="pfpts_' + pid + ' reallysmall" style="text-decoration:underline;">' + ppts + '</div></td></tr>\n';
                rowcnt++;
            }
            if(rk == 'S' && ls_hfa[fid] != undefined && ls_hfa[fid] != 0
               && which == 'home') {
                var rowstyle = (rowcnt % 2) ? "oddtablerow" : "eventablerow"
                rowstyle = rowstyle + " " + rowclass + " newposition";
                html = html + '<tr class="' + rowstyle + '"><td class="reallysmall">Home Field Advantage</td>';
                html = html + '<td class="ls_game_info"><div class="reallysmall">&nbsp;</div></td>';
                html = html + '<td class="ls_player_stats"><div class="reallysmall">&nbsp;</div></td>'; 
                html = html + '<td align="right"><div class="reallysmall">' + ls_hfa[fid] + '</div></td></tr>\n';
                rowcnt++;
            }
            if(rk == 'S' && ls_adjust[fid] != undefined) {
                var rowstyle = (rowcnt % 2) ? "oddtablerow" : "eventablerow"
                rowstyle = rowstyle + " " + rowclass + " newposition";
                html = html + '<tr class="' + rowstyle + '"><td class="reallysmall">' + ls_adjust[fid].label + '</td>';
                html = html + '<td class="ls_game_info"><div class="reallysmall">&nbsp;</div></td>';
                html = html + '<td class="ls_player_stats"><div class="reallysmall">&nbsp;</div></td>'; 
                html = html + '<td align="right"><div class="reallysmall">' +
                              format_points( ls_adjust[fid].value) +
                              '</div></td></tr>\n';
                rowcnt++;
            }
            if(rk == 'S' || rk == 'NS') {
                var rowstyle = (rowcnt % 2) ? "odd" : "even"
                html = html + '<tr class="' + rowstyle + 'tablerow ' + rowclass + '"><td align="left"><b>Total Points</b></td><td class="ls_game_info">&nbsp;</td><td class="ls_player_stats">&nbsp;</td><td class="ls_marquee_value" align="right"><div id="';
                if(rk == 'S') {
                    html = html + 'fspts_';
                }
                else {
                    html = html + 'frpts_';
                }
                var totpts = (rk == 'S') ?  ls_fran_totals[fid].total :
                                            ls_fran_totals[fid].nstotal;
                html = html + fid + '">' + format_points(totpts) + '</div></td></tr>\n';
            }
        }
        else if (rk == 'S') {
            html = html + '<tr><th colspan="4">This franchise did not set a lineup this week or the lineups are hidden.</th><tr>\n';
        }
      }
    }
    load_elem("roster_"+which, html);
    if(ls_should_hide_gs) {
        hide_by_class("ls_game_info", true, "table-cell");
    }
    if(ls_should_hide_ps) {
        hide_by_class("ls_player_stats", true, "table-cell");
    }
    if(ls_should_hide_rs) {
        hide_by_class("ls_nonstarters", true, "table-row");
    }
    if(ls_should_hide_ts) {
        hide_by_id("ls_ticker_tab_id", true, "inline");
    }
}

function ls_hide_game_info (checkbox) {
    ls_should_hide_gs = checkbox.checked;
    hide_by_class("ls_game_info", ls_should_hide_gs, "table-cell");
    ls_set_defaults();
}

function ls_hide_stats (checkbox) {
    ls_should_hide_ps = checkbox.checked;
    hide_by_class("ls_player_stats", ls_should_hide_ps, "table-cell");
    ls_set_defaults();
}

function ls_hide_nonstarters (checkbox) {
    ls_should_hide_rs = checkbox.checked;
    hide_by_class("ls_nonstarters", ls_should_hide_rs, "table-row");
    ls_set_defaults();
}

function ls_hide_ticker (checkbox) {
    ls_should_hide_ts = checkbox.checked;
    hide_by_id("ls_ticker_tab_id", ls_should_hide_ts, "inline");
    ls_set_defaults();
}

function ls_set_defaults () {
    var new_val = "";
    var gi_cb_elem = document.getElementById("hide_game_info_cb");
    if(gi_cb_elem != undefined) {
        new_val = new_val + "hide_game_status=" +
                                 (gi_cb_elem.checked ? "1" : "0");
    }
    var ps_cb_elem = document.getElementById("hide_stats_cb");
    if(ps_cb_elem != undefined) {
        new_val = new_val + "|hide_player_stats=" +
                                 (ps_cb_elem.checked ? "1" : "0");
    }
    var ns_cb_elem = document.getElementById("hide_nonstarters_cb");
    if(ns_cb_elem != undefined) {
        new_val = new_val + "|hide_nonstarters=" +
                                 (ns_cb_elem.checked ? "1" : "0");
    }
    var ts_cb_elem = document.getElementById("hide_ticker_cb");
    if(ts_cb_elem != undefined) {
        new_val = new_val + "|hide_ticker=" +
                                 (ts_cb_elem.checked ? "1" : "0");
    }
    mfl_set_cookie("ls_settings",new_val, 250, "/" + year);
}

function show_game (home, away) {
    ls_avg_field = "";
    if(away) {
        init_marquee("away",away);
        build_one_team("away",away);
    }
    if(home) {
        init_marquee("home",home);
        build_one_team("home",home);
    }
    build_other_games(home,away);
}

function switch_game (home, away) {
    show_game(home,away);
    ls_update_all = 1;
    update_scores();
}

function get_stats_str (pid) {
    var groups = [];
    if(ls_stats[pid] == undefined) {
        return "";
    }
    if(ls_stats[pid].PA > 0) {
        var subgr = [];
        if(ls_stats[pid].PC === undefined) {
            ls_stats[pid].PC = 0;
        }
        if(ls_stats[pid].PY === undefined) {
            ls_stats[pid].PY = 0;
        }
        subgr.push("Pass:&nbsp;" + ls_stats[pid].PC + "/" + ls_stats[pid].PA + "/" + ls_stats[pid].PY);
        if(ls_stats[pid]["#P"] > 0) {
            subgr.push(ls_stats[pid]["#P"] + "&nbsp;PaTD&nbsp;(" + ls_stats[pid].PS + ")");
        }
        if(ls_stats[pid].IN > 0) {
            subgr.push(ls_stats[pid].IN + "&nbsp;Int");
        }
        if(ls_stats[pid]["P2"] > 0) {
            subgr.push(ls_stats[pid]["P2"] + "&nbsp;Pa2P");
        }
        groups.push(subgr.join(", "));
    } 
    else if(ls_stats[pid]["P2"] > 0) {
        groups.push(ls_stats[pid]["P2"] + "&nbsp;Pa2P");
    }
    if(ls_stats[pid].RA > 0) {
        var subgr = [];
        if(ls_stats[pid].RY == undefined) {
            ls_stats[pid].RY = 0;
        }
        subgr.push("Rush:&nbsp;" + ls_stats[pid].RA + "/" + ls_stats[pid].RY);
        if(ls_stats[pid]["#R"] > 0) {
            subgr.push(ls_stats[pid]["#R"] + "&nbsp;RuTD&nbsp;(" + ls_stats[pid].RS + ")");
        }
        if(ls_stats[pid]["R2"] > 0) {
            subgr.push(ls_stats[pid]["R2"] + "&nbsp;Ru2P");
        }
        groups.push(subgr.join(", "));
    }
    else if(ls_stats[pid]["R2"] > 0) {
        groups.push(ls_stats[pid]["R2"] + "&nbsp;Ru2P");
    }
    if(ls_stats[pid].CC > 0) {
        var subgr = [];
        if(ls_stats[pid].CY == undefined) {
            ls_stats[pid].CY = 0;
        }
        subgr.push("Rec:&nbsp;" + ls_stats[pid].CC + "/" + ls_stats[pid].CY);
        if(ls_stats[pid]["#C"] > 0) {
            subgr.push(ls_stats[pid]["#C"] + "&nbsp;ReTD&nbsp;(" + ls_stats[pid].RC + ")");
        }
        if(ls_stats[pid]["C2"] > 0) {
            subgr.push(ls_stats[pid]["C2"] + "&nbsp;Re2P");
        }
        groups.push(subgr.join(", "));
    }
    else if(ls_stats[pid]["C2"] > 0) {
        groups.push(ls_stats[pid]["C2"] + "&nbsp;Re2P");
    }
    if(ls_stats[pid].FL > 0) {
        groups.push(ls_stats[pid].FL + "&nbsp;Fum&nbsp;Lost");
    }
    if(ls_uses_idps && (ls_stats[pid].TK > 0 || ls_stats[pid].AS > 0 || ls_stats[pid].PD > 0)) {
        var subgr = [];
        if(ls_stats[pid].TK > 0) {
            subgr.push(ls_stats[pid].TK + "&nbsp;T");
        }
        if(ls_stats[pid].TFL > 0) {
            subgr.push(ls_stats[pid].TKL + "&nbsp;TFL");
        }
        if(ls_stats[pid].AS > 0) {
            subgr.push(ls_stats[pid].AS + "&nbsp;A");
        }
        if(ls_stats[pid].SK > 0) {
            subgr.push(ls_stats[pid].SK + "&nbsp;SK");
        }
        if(ls_stats[pid].PD > 0) {
            subgr.push(ls_stats[pid].PD + "&nbsp;PD");
        }
        if(ls_stats[pid].IC > 0) {
            var str = ls_stats[pid].IC + "&nbsp;INT";
            if(ls_stats[pid]["#IR"] > 0) {
                str = str + "&nbsp;" + ls_stats[pid]["#IR"] + "&nbsp;IntTD&nbsp;(" + ls_stats[pid].IR + ")";
            }
            subgr.push(str);
        }
        if(ls_stats[pid].FF > 0) {
            subgr.push(ls_stats[pid].FF + "&nbsp;FF");
        }
        if(ls_stats[pid].FC > 0) {
            var str = ls_stats[pid].FC + "&nbsp;FR";
            if(ls_stats[pid]["#DR"] > 0) {
                str = str + "&nbsp;" + ls_stats[pid]["#DR"] + "&nbsp;FRTD&nbsp;(" + ls_stats[pid].DR + ")";
            }
            subgr.push(str);
        }
        groups.push(subgr.join(", "));
    }
    if(ls_stats[pid]["#A"] > 0 || ls_stats[pid].EA > 0) {
        var subgr = [];
        var str = "Kick:&nbsp;";
        if(ls_stats[pid]["#A"] > 0) {
            var dist = "";
            if(ls_stats[pid]["#F"] === undefined) {
                ls_stats[pid]["#F"] = 0;
            }
            if(ls_stats[pid].FG != undefined) {
                    dist = "(" + ls_stats[pid].FG + ")";
            }
            subgr.push(str + ls_stats[pid]["#F"] + "/" + ls_stats[pid]["#A"] + "&nbsp;FG&nbsp;" + dist);
            str = "";
        }
        if(ls_stats[pid].EA > 0) {
            if(ls_stats[pid].EP === undefined) {
                ls_stats[pid].EP = 0;
            }
            subgr.push(str + ls_stats[pid].EP + "/" + ls_stats[pid].EA + "&nbsp;XP");
            str = "";
        }
        groups.push(subgr.join(", "));
    }
    return groups.join("; ");
}

function get_tstats_str (team) {
    var groups = [];
    for (var i = 0; i < show_tstats.length; i++) {
        var stat = show_tstats[i];
        if(ls_tstats[team][stat] != undefined && ls_tstats[team][stat] != 0) {
            groups.push(ls_tstats[team][stat] + " " + stat);
        }
    }
    if(ls_tstats[team].FC > 0) {
        groups.push(ls_tstats[team].FC + "&nbsp;FR");
        if(ls_tstats[team]["#DR"] > 0) {
            groups.push(ls_tstats[team]["#DR"] + "&nbsp;FR&nbsp;TD&nbsp;(" + ls_tstats[team].DR + ")");
        }
    }
    if(ls_tstats[team].IC > 0) {
        groups.push(ls_tstats[team].IC + "&nbsp;Int");
        if(ls_tstats[team]["#IR"] > 0) {
            groups.push(ls_tstats[team]["#IR"] + "&nbsp;Int&nbsp;TD&nbsp;(" + ls_tstats[team].IR + ")");
        }
    }
    if(ls_tstats[team]["#KT"] > 0) {
        groups.push(ls_tstats[team]["#KT"] + "&nbsp;KTD&nbsp;(" + ls_tstats[team].KO + ")");
    }
    if(ls_tstats[team]["#UT"] > 0) {
        groups.push(ls_tstats[team]["#UT"] + "&nbsp;PTD&nbsp;(" + ls_tstats[team].PR + ")");
    }
    if(ls_tstats[team].BLF > 0) {
        groups.push(ls_tstats[team].BLF + "&nbsp;BLF");
        if(ls_tstats[team]["#BF"] > 0) {
            groups.push(ls_tstats[team]["#BF"] + "&nbsp;BF&nbsp;(" + ls_tstats[team].BF + ")");
        }
    }
    if(ls_tstats[team].BLP > 0) {
        groups.push(ls_tstats[team].BLP + "&nbsp;BLP");
        if(ls_tstats[team]["#BP"] > 0) {
            groups.push(ls_tstats[team]["#BP"] + "&nbsp;BP&nbsp;(" + ls_tstats[team].BP + ")");
        }
    }
    if(ls_tstats[team].BLE > 0) {
        groups.push(ls_tstats[team].BLE + "&nbsp;BLE");
    }
    return(groups.join(", "));
}

function get_otstats_str (team) {
    var groups = [];
    for (var i = 0; i < show_ostats.length; i++) {
        var stat = show_ostats[i];
        if(ls_tstats[team][stat] != undefined && ls_tstats[team][stat] != 0) {
            groups.push(ls_tstats[team][stat] + " " + stat);
        }
    }
    return(groups.join(", "));
}

function get_best_lineup(fid) {
    ls_rosters[fid].S = [];
    ls_rosters[fid].NS = [];
    var temp_roster = [];
    ls_fran_totals[fid]["best_lineup"] = "";
    if(ls_rosters[fid].R == undefined) {
        return;
    }
    for (i = 0; i < ls_rosters[fid].R.length; i++) {
        temp_roster.push(ls_rosters[fid]["R"][i]);
    }
    //console.log("Orig roster for " + fid + ": " + temp_roster.join(","));
    temp_roster.sort(function(a,b) {
        var nfl_team_a = ls_player[a].nfl_team;
        var nfl_team_b = ls_player[b].nfl_team;
        if(nfl_team_a == undefined || /^FA/.test(nfl_team_a)) {
            return 1;
        }
        else if(nfl_team_b == undefined || /^FA/.test(nfl_team_b)) {
            return -1;
        }
        else if(ls_nfl_games[nfl_team_a].opp == 'BYE') {
            return 1;
        }
        else if(ls_nfl_games[nfl_team_b].opp == 'BYE') {
            return -1;
        }
        else {
            if(ls_player[a].points != undefined && 
               ls_player[b].points != undefined) {
                if(ls_player[a].points < ls_player[b].points) {
                    return 1;
                }
                else if(ls_player[a].points > ls_player[b].points) {
                    return -1;
                }
            }
            else if(ls_player[a].points == undefined &&
                    ls_player[b].points != undefined) {
                return 1;
            }
            else if(ls_player[a].points != undefined &&
                    ls_player[b].points == undefined) {
                return -1;
            }
        }
        if(ls_player[a].name < ls_player[b].name) {
            return -1
        }
        else {
            return 1;
        }
    });
    //console.log("Sorted roster for " + fid + ": " + temp_roster.join(","));
    var pos_counts = [];
    for (i = 0; i < ls_league_pos.length; i++) {
        var lpos = ls_league_pos[i];
        pos_counts[lpos] = 0;
    }
    for (i = 0; i < temp_roster.length; i++) {
        var lpos = ls_player[temp_roster[i]].lpos;
        pos_counts[lpos] += 1;
    }
    var num_starters = ls_num_starters;
    var got_starters = [];
    for (i = 0; i < ls_league_pos.length; i++) {
        var lpos = ls_league_pos[i];
        if(ls_min_pos[lpos] > pos_counts[lpos]) {
            num_starters -= (ls_min_pos[lpos] - pos_counts[lpos]);
        }
        got_starters[lpos] = 0;
    }
    //console.log("ls_num_starters=" + ls_num_starters + " num_starters=" + num_starters);
    got_starters["IDP"] = 0;
    var got_pid = [];
    var starter_count = 0;
    for (pass = 0; pass < 3; pass++) {
        if(pass != 1 || ls_idps > 0) {
            for (i = 0; i < temp_roster.length; i++) {
                var pid = temp_roster[i];
                var lpos = ls_player[pid].lpos;
                if(got_pid[pid]) {
                }
                else if(got_starters[lpos] >= ls_max_pos[lpos]) {
                }
                else if(pass == 2 && ls_idps > 0 && ls_is_idp_pos[lpos]){
                }
                else {
                    if(starter_count < num_starters &&
   ((pass != 1 && (got_starters[lpos] < (pass == 0 ? ls_min_pos[lpos] : ls_max_pos[lpos]))) ||
    (pass == 1 && got_starters["IDP"] < ls_idps && ls_is_idp_pos[lpos]))) {
                        starter_count++;
                        got_starters[lpos]++;
                        if(ls_is_idp_pos[lpos]) {
                            got_starters["IDP"]++;
                        }
                        got_pid[pid] = 1;
                    }
                }
            }
        }
    }
    for (i = 0; i < ls_rosters[fid].R.length; i++) {
        var pid = ls_rosters[fid]["R"][i];
        if(got_pid[pid]) {
            ls_rosters[fid]["S"].push(pid);
        }
        else {
            ls_rosters[fid]["NS"].push(pid);
        }
    }
    ls_fran_totals[fid]["best_lineup"] =  ls_rosters[fid]["S"].join(",");
    //console.log("Best lineup for " + fid + ": " + ls_fran_totals[fid].best_lineup);
    return;
}

for (var longkey in franchiseDatabase) {
    var fid = longkey.substr(4,4);
    if(fid != "0000") {
        ls_fran_totals[fid] = { total:0, nstotal:0, pmr:999, playing:0,
                                ytp:9, proj:0, fin:"" };
    }
}



