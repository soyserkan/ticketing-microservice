import { DataSource } from 'typeorm';
import { Config } from './app.config';

const datasource = new DataSource(Config.database);
export default datasource;
