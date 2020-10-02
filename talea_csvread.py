import csv
import os
import sys
import json

filename = sys.argv[1]
curpath, curfile = os.path.split(filename)
basename, ext = os.path.splitext(curfile)
outfile = os.path.join(curpath, basename + ".js")

base_keys = ['qtr_len', 'qtr_index', 'elt_subdiv']
elt_keys = ['len', 'subidx', 'type','dyn', 'dir', 'plo', 'phi']
cur_arr = []

def convert_ints(cur_arr):
    return [int(x) if x.isdigit() else x for x in cur_arr]

with open(filename) as f:
    cur_read = csv.reader(f, delimiter=",")
    cur_keys = next(cur_read)
    for row in cur_read:
        base_elts = convert_ints(row[:3])
        rest_elts = convert_ints(row[3:])
        cur_dict = dict(zip(base_keys, base_elts))
        elt_arr = []
        for i in range(0,len(rest_elts),len(elt_keys)):
            cur_eltdir = dict(zip(elt_keys, rest_elts[i:(i+len(elt_keys))]))
            elt_arr += [cur_eltdir]
        cur_dict['elts'] = elt_arr
        cur_arr += [cur_dict]

tot_len = sum([x["qtr_len"] for x in cur_arr])
ret_json = {"data": cur_arr, "total_len": tot_len}

with open(outfile, 'w') as o:
    json.dump(ret_json, o)
