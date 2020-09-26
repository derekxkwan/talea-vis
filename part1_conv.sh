#!/bin/bash

for i in {1..5}
do
    fname="bailliet_rev$i.csv"
    python3 talea_csvread.py $fname
done
