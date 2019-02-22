<template>
    <div class="invoice">
        <Card>
            <h3>Création d'un reçu</h3>

            <form v-if="!url" @submit.prevent="invoice">
                <TextInput v-model="name" label="Société" autofocus />
                <TextInput v-model="tva" label="N° de TVA intracommunautaire" />
                <TextInput v-model="address" label="Adresse" />
                <TextInput v-model="postal" label="Code postal" />
                <TextInput v-model="city" label="Ville" />
                <TextInput v-model="country" label="Pays" />

                <div class="actions">
                    <Button to="/dashboard/history">Retour</Button>
                    <Button raised>Valider</Button>
                </div>
            </form>
            <template v-else>
                <iframe :src="url" frameborder="0" />

                <div class="actions">
                    <Button to="/dashboard/history">Retour</Button>
                    <Button raised @click="download">Télécharger</Button>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
import { invoice } from 'config/manager';
import PDF from '@/lib/pdf';
import { mapActions, mapGetters } from 'vuex';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/currency';
import Card from '@/components/Card';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';

export default {
    name: 'Invoice',

    components: {
        Card,
        TextInput,
        Button
    },

    data: () => {
        const date = new Date();

        return {
            name: '',
            tva: '',
            address: '',
            postal: '',
            city: '',
            country: 'France',
            filename: 'invoice.pdf',
            url: null,
            invoiceNumber: `${date.getFullYear()}${date.getMonth()}${date.getDate()}`,
        }
    },

    computed: {
        ...mapGetters({
            history: 'history/history'
        })
    },

    async mounted() {
        const { invoiceNumber } = await this.post({ url: 'account/invoice-number', body: {} })

        this.invoiceNumber = invoiceNumber
    },

    methods: {
        invoice() {
            this.setWorking(true);

            const doc = new PDF();
            const date = new Date();

            const title = `Reçu n°F${this.invoiceNumber}`;

            this.filename = `recu.cashless.f${this.invoiceNumber}.pdf`;

            doc.setProperties({
                title,
                subject: 'Reçu cashless',
                author: 'Buckless',
                creator: 'Buckless'
            });

            // margins
            const y = n => n + 20;
            const x = n => n + 15;
            const rx = n => n + 195;

            doc.setFontSize(14);

            // dates
            doc.addText(title, x(0), y(0));
            doc.setFontSize(12);
            doc.addText(
                `Au ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
                x(0),
                y(7)
            );

            // sender
            doc.setFontSize(14);
            doc.addText('Émetteur', x(0), y(18));

            doc.setFontSize(12);
            doc.addText(invoice.senderName, x(0), y(25));
            doc.addText(invoice.senderAddress, x(0), y(30));
            doc.addText(invoice.senderPostal, x(0), y(35));
            doc.addText(invoice.senderCity, x(0), y(40));
            doc.addText(invoice.senderCountry, x(0), y(45));
            doc.addText(invoice.senderPhone, x(0), y(50));

            // reciever
            doc.setFontSize(14);
            doc.addText('Destinataire', rx(0), y(18), 'right');

            doc.setFontSize(12);
            doc.addText(this.name, rx(0), y(25), 'right');
            doc.addText(this.tva, rx(0), y(30), 'right');
            doc.addText(this.address, rx(0), y(35), 'right');
            doc.addText(this.postal, rx(0), y(40), 'right');
            doc.addText(this.city, rx(0), y(45), 'right');
            doc.addText(this.country, rx(0), y(50), 'right');

            const head = [
                { header: 'Désignation', dataKey: 'name' },
                { header: 'TVA', dataKey: 'tva' },
                { header: 'P.U. HT', dataKey: 'pu' },
                { header: 'Qté', dataKey: 'qte' },
                { header: 'Total HT', dataKey: 'total' }
            ];

            const body = this.history
                .filter(entry => entry.rawType === 'reload')
                .map(entry => ({
                    name: `Rechargement ${formatDate(entry.date)}`,
                    tva: '0%',
                    pu: formatCurrency(entry.amount / 100).replace('€', 'e'),
                    qte: '1',
                    total: formatCurrency(entry.amount / 100).replace('€', 'e')
                }));

            let total = this.history
                .filter(entry => entry.rawType === 'reload')
                .map(entry => entry.amount)
                .reduce((a, b) => a + b, 0);

            total = formatCurrency(total / 100).replace('€', 'e');

            body.push({ name: 'Total HT', total });
            body.push({ name: 'Total TVA 0%', total: '0,00e' });
            body.push({ name: 'Total TTC', total });

            doc.autoTable(head, body, {
                startY: y(60),
                headStyles: {
                    textColor: 10,
                    fillColor: [26, 188, 156],
                    halign: 'right'
                },
                columnStyles: {
                    name: { cellWidth: 80 },
                    tva: { halign: 'right', cellWidth: 'wrap' },
                    pu: { halign: 'right', cellWidth: 'wrap' },
                    qte: { halign: 'right', cellWidth: 'wrap' },
                    total: { halign: 'right', cellWidth: 'wrap' }
                },
                didParseCell(data) {
                    if (data.section === 'head' && data.column.dataKey === 'name') {
                        data.cell.styles.halign = 'left';
                    }

                    // set 3 last columns to colspan + right halign
                    if (data.table.body.length < body.length - 2) {
                        return;
                    }

                    if (data.column.dataKey === 'name') {
                        data.cell.colSpan = 4;
                    }

                    data.cell.styles.halign = 'right';
                    data.cell.styles.fillColor = '#fff';

                    // make last line bold
                    if (data.table.body.length === body.length) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            this.url = doc.output('bloburl');

            this.setWorking(false);
        },

        download() {
            const link = document.createElement('a');
            link.style = 'display: none';
            link.href = this.url;
            link.download = this.filename;

            document.body.appendChild(link);

            link.click();
        },

        ...mapActions({
            post: 'request/post',
            setWorking: 'working/set'
        })
    }
};
</script>

<style lang="scss" scoped>
.input-wrapper {
    margin-top: 1rem;
}

iframe {
    width: 100%;
    min-height: 400px;
}
</style>
