import { Container, List } from "@mui/material";
import React from "react";
import TransactionElement from './TransactionElement';

const TransactionOverview = () => {

    const transactions = [
        {
            id: 1,
            name: "Alphabet",
            count: 4,
            pricePerShare: 2350,
            totalPrice: -9400,
            date: '06.12.2021',
        },
        {
            id: 2,
            name: "Meta",
            count: 1,
            pricePerShare: 192,
            totalPrice: -192,
            date: '01.01.2021',
        },
        {
            id: 3,
            name: "Amazon.com, Inc.",
            count: 1,
            pricePerShare: 2672,
            totalPrice: -2672,
            date: '03.07.2021',
        }
    ]

    return <Container
        maxWidth="lg"
        spacing={0}
        sx={{ marginTop: '4rem' }}
    >
        <List>
            {transactions.map((transaction, index) => (
                <TransactionElement key={transaction.id} transaction={transaction} isLast={index === transactions.length - 1} />
            ))}
        </List>
    </Container>
};

export default TransactionOverview;