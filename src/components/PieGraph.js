// piegraph.js
import React from 'react';
import { Grid, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip } from 'recharts';
const PieGraph = ({ data, title, datakey, namekey }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <PieChart width={400} height={300}>
                <Pie
                    dataKey={datakey}
                    nameKey={namekey}
                    isAnimationActive={false}
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                />
                <Tooltip />
            </PieChart>
        </Grid>
    );
}

export default PieGraph;