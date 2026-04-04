import React from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Swal from 'sweetalert2';
export default function Edit() {

    // destruct permissions from usepage props
    const { permission } = usePage().props;

    // define state with helper inertia
    const { data, setData, post, errors } = useForm({
        name : permission.name,
        _method: 'put'
    });

    // define method handleUpdateData
    const handleUpdateData = async (e) => {
        e.preventDefault();

        post(route('permissions.update', permission.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Data updated successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        });
    }

    return (
        <DashboardLayout title="Edit Permission">
            <Head title={'Edit Permissions'}/>
                <Card title={'Edit permission'}>
                    <form onSubmit={handleUpdateData}>
                        <div className='mb-4'>
                            <Input label={'Permission Name'} type={'text'} value={data.name} onChange={e => setData('name', e.target.value)} errors={errors.name} placeholder="Input permission name.."/>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button type={'submit'} />
                            <Button type={'cancel'} url={route('permissions.index')}/>
                        </div>
                    </form>
                </Card>
        </DashboardLayout>
    )
}
