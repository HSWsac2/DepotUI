import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./DepotOverview.css";
import { Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DepotContext } from "../../../context/DepotContext";
import axios from "axios";
import moment from "moment";
import 'chartjs-adapter-moment';
import { ErrorCode } from "../../common/enums/ErrorCodes";

ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function DepotOverview() {

    const [stocks, setStocks] = useState([]);
    const { currentDepot } = useContext(DepotContext);
    const [history, setHistory] = useState([]);
    const [historyValues, setHistoryValues] = useState([]);
    const currencyFormat = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            //Einzelaktien des aktuellen Depots abfragen
            axios
                .get(
                    `${process.env.REACT_APP_BACKEND_URL_TRANSACTION_SERVICE}depots/${currentDepot.position_id}/${currentDepot.position_sub_id}/currentStocks`
                )
                .then((res) => {
                    setStocks(res.data);
                });
        };
        if (currentDepot) {
            fetchTransactions();
        } else {
            setStocks([]);
        }
    }, [currentDepot]);

    useEffect(() => {
        const fetchHistory = async () => {
            //Depot-Historie abfragen
            axios
                .get(
                    `${process.env.REACT_APP_BACKEND_URL_DEPOT_SERVICE}depots/history/${currentDepot.position_id}/${currentDepot.position_sub_id}`
                )
                .then((res) => {
                    const history = res.data.sort((a, b) =>
                        moment(a.keydate, "YYYY-MM-DD").isAfter(
                            moment(b.keydate, "YYYY-MM-DD")
                        )
                    );
                    setHistoryValues(history.slice(-30)); //.map(a => ({ ...a, keydate: moment(a.keydate, "YYYY-MM-DD") })
                })
                .catch(error => {
                    if (error?.response?.status !== 404 || error?.response?.data?.detail !== ErrorCode.INVALID_POSITION_ID_OR_POSITION_SUB_ID) {
                        // no data found is not a functional error that requires attention
                        console.error(error);
                    }
                });
            }
            if (currentDepot) {
                fetchHistory();
            } else {
                setHistory([]);
            }
        }, [currentDepot, history]);

    const data = {
        labels: historyValues.map(h => h.keydate),
        datasets: [{
            label: 'Depotwert',
            data: historyValues.map(h => h.depot_value),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'DD.MM.YYYY',
                    displayFormats: {
                        day: 'DD.MM.'
                    },
                }
            },
            y: {
                ticks: {
                    callback: value => currencyFormat.format(value),
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                displayColors: false,
                callbacks: {
                    label: h => currencyFormat.format(h.raw),
                }
            },
        },

    };

    return (
        <div>
            <Grid className='depotGrid' container spacing={2}>
                <Grid item xs={6} md={8}>
                    <h3>Buying Power</h3>
                    <h1>{currencyFormat.format(currentDepot?.buying_power)}</h1>
                </Grid>
                {historyValues?.length > 1 &&
                    <Grid item xs={6} md={4}>
                        <h3>Depotwert</h3>
                        <h1>{currencyFormat.format(historyValues[historyValues.length - 1].depot_value)}</h1>
                    </Grid>
                }
                <Grid item xs={12} md={12} height={"60rem"} sx={{ maxHeight: '60vh' }}>
                    <Line options={options} data={data}></Line>
                </Grid>
                <Grid item xs={12} md={12}>
                    <h2>Einzelpositionen</h2>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ISIN</TableCell>
                                    <TableCell align="right">Anzahl</TableCell>
                                    <TableCell align="right">Einkaufspreis</TableCell>
                                    <TableCell align="right">Aktueller Preis</TableCell>
                                    <TableCell align="right">Wachstum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stocks.map((row) => (
                                    <TableRow
                                        key={row.isin}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.isin}
                                        </TableCell>
                                        <TableCell align="right">{row.piece_amt}</TableCell>
                                        <TableCell align="right">{row.buying_price}€</TableCell>
                                        <TableCell align="right">{row.current_price}€</TableCell>
                                        <TableCell align="right">{row.growth_rate < 0 ? Number(row.growth_rate).toFixed(2) + "%" : "+" + Number(row.growth_rate).toFixed(2) + "%"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
}
